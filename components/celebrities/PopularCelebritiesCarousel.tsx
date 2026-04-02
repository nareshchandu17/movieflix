"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import CelebrityCard from "./CelebrityCard";
import { tmdbAPI } from "@/lib/api/tmdb";
import { TOP_20_ACTORS } from "@/lib/data/actorsData";
import { TOP_20_ACTRESSES } from "@/lib/data/actressesData";
import Link from "next/link";

interface Celebrity {
  name: string;
  profileURL: string;
  id: number;
  type: "actor" | "actress";
}

const PopularCelebritiesCarousel: React.FC = () => {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        setLoading(true);
        
        // Fetch both actors and actresses concurrently
        const [actorsData, actressesData] = await Promise.allSettled([
          tmdbAPI.getMultipleActors(TOP_20_ACTORS),
          tmdbAPI.getMultipleActors(TOP_20_ACTRESSES)
        ]);

        // Process actors data
        const actors = actorsData.status === "fulfilled" 
          ? actorsData.value.map(actor => ({ ...actor, type: "actor" as const }))
          : [];

        // Process actresses data  
        const actresses = actressesData.status === "fulfilled"
          ? actressesData.value.map(actress => ({ ...actress, type: "actress" as const }))
          : [];

        // Combine and shuffle for mixed display
        const allCelebrities = [...actors, ...actresses];
        
        // Shuffle array to mix actors and actresses
        const shuffled = allCelebrities.sort(() => Math.random() - 0.5);
        
        // Take top 20 for display
        setCelebrities(shuffled.slice(0, 20));
        
      } catch (err) {
        setError("Failed to load celebrities");
        console.error("Error fetching celebrities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrities();
  }, []);

  // Update card width based on window size
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) {
        setCardWidth(200);
      } else if (width >= 640) {
        setCardWidth(180);
      } else {
        setCardWidth(160);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = cardWidth * 2 + 12; // Card width * 2 + gap (gap-3 = 12px)
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Section Header */}
      

      {/* Full-Bleed Scroll Container */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="relative group">
          <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular Celebrities</h2>
            <p className="text-gray-400">Discover talented actors and actresses from cinema's finest</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/actors"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">Actors</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/actresses"
            className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">Actresses</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
        
          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-purple-500/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-purple-500/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Skeleton Loaders
              Array.from({ length: 12 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 animate-pulse border border-gray-700/50" />
                    <div className="w-full h-4 bg-gray-800 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : (
              celebrities.map((celebrity) => (
                <div key={`${celebrity.type}-${celebrity.id}`} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                  <CelebrityCard
                    name={celebrity.name}
                    profileURL={celebrity.profileURL}
                    id={celebrity.id}
                    type={celebrity.type}
                    size="medium"
                  />
                </div>
              ))
            )}
            <div className="flex-shrink-0 w-12 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularCelebritiesCarousel;
