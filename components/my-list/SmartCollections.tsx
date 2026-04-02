"use client";

import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, Plus, Heart, Star, Sun, Cloud, Moon, Popcorn } from "lucide-react";

interface Collection {
  _id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  itemCount: number;
  createdAt: string;
}

interface CollectionItem {
  _id: string;
  tmdbId: number;
  mediaType: "movie" | "series" | "anime";
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  watchProgress: number;
  watched: boolean;
  lastWatchedAt: string | null;
  addedAt: string;
}

interface SmartCollectionsProps {
  collections: Collection[];
}

const colorClasses = {
  yellow: "from-yellow-500 to-yellow-600",
  blue: "from-blue-500 to-blue-600", 
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
  pink: "from-pink-500 to-pink-600",
  amber: "from-amber-500 to-amber-600",
  green: "from-green-500 to-green-600",
  gray: "from-gray-500 to-gray-600"
};

const borderColors = {
  yellow: "hover:border-yellow-500/50 hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]",
  blue: "hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
  purple: "hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(147,51,234,0.3)]",
  red: "hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]",
  pink: "hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.3)]",
  amber: "hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]",
  green: "hover:border-green-500/50 hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]",
  gray: "hover:border-gray-500/50 hover:shadow-[0_0_25px_rgba(107,114,128,0.3)]"
};

const getCollectionIcon = (name: string): React.ReactNode => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("morning")) return <Sun className="w-5 h-5" />;
  if (lowerName.includes("afternoon")) return <Cloud className="w-5 h-5" />;
  if (lowerName.includes("night")) return <Moon className="w-5 h-5" />;
  if (lowerName.includes("weekend") || lowerName.includes("binge")) return <Popcorn className="w-5 h-5" />;
  if (lowerName.includes("favorite") || lowerName.includes("love")) return <Heart className="w-5 h-5" />;
  if (lowerName.includes("top") || lowerName.includes("10")) return <Star className="w-5 h-5" />;
  return <Plus className="w-5 h-5" />;
};

export default function SmartCollections({ collections }: SmartCollectionsProps) {
  const [hoveredCard, setHoveredCard] = useState<{ collectionId: string; itemId: string } | null>(null);
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});
  const [collectionsItems, setCollectionsItems] = useState<Record<string, CollectionItem[]>>({});

  useEffect(() => {
    // Fetch items for each collection
    const fetchCollectionItems = async () => {
      const itemsData: Record<string, CollectionItem[]> = {};
      
      for (const collection of collections) {
        try {
          const response = await fetch(`/api/mylist/items/${collection._id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              itemsData[collection._id] = data.items;
            }
          }
        } catch (error) {
          console.error(`Error fetching items for collection ${collection._id}:`, error);
          itemsData[collection._id] = [];
        }
      }
      
      setCollectionsItems(itemsData);
    };

    if (collections.length > 0) {
      fetchCollectionItems();
    }
  }, [collections]);

  const scrollCarousel = (collectionId: string, direction: "left" | "right") => {
    const carousel = document.getElementById(`collection-${collectionId}`);
    if (carousel) {
      const scrollAmount = 220; // Card width + gap
      const currentPosition = scrollPositions[collectionId] || 0;
      const newPosition = direction === "left" 
        ? Math.max(0, currentPosition - scrollAmount)
        : currentPosition + scrollAmount;
      
      carousel.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
      setScrollPositions(prev => ({ ...prev, [collectionId]: newPosition }));
    }
  };

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Smart Collections</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
      </div>

      {/* Collections */}
      <div className="space-y-16">
        {collections.map((collection) => (
          <div key={collection._id} className="space-y-6">
            {/* Collection Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br ${colorClasses[collection.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {getCollectionIcon(collection.name)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{collection.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">{collection.description || `${collectionsItems[collection._id]?.length || 0} items curated`}</p>
                </div>
              </div>
            </div>

            {/* Grid of Posters */}
            {(!collectionsItems[collection._id] || collectionsItems[collection._id].length === 0) ? (
              <div className="py-12 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-center justify-center">
                <p className="text-gray-500 font-medium italic">Empty collection</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
                {collectionsItems[collection._id].map((item) => (
                  <div
                    key={item._id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard({ collectionId: collection._id, itemId: item._id })}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`relative aspect-[2/3] ring-1 ring-white/10 rounded-xl overflow-hidden transition-all duration-500 group-hover:ring-offset-4 group-hover:ring-offset-black group-hover:ring-2 group-hover:ring-primary group-hover:-translate-y-2 card-glow-hover`}>
                      <img
                        src={item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "https://i.imgur.com/wjVuAGb.png"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300 text-black">
                            <Play className="w-6 h-6 fill-current" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs font-bold truncate">{item.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                            <span className="text-gray-300 text-[10px]">{item.voteAverage?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
