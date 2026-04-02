"use client";

import { useState } from "react";
import { Play, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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

interface ContinueWatchingProps {
  items: CollectionItem[];
}

export default function ContinueWatching({ items }: ContinueWatchingProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Only show items with progress > 0 and < 100
  const continueItems = items.filter(item => item.watchProgress > 0 && item.watchProgress < 100);

  if (continueItems.length === 0) {
    return null;
  }

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = document.getElementById("continue-watching-carousel");
    if (carousel) {
      const scrollAmount = 180; // Updated for smaller card width + gap
      const newPosition = direction === "left" 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      carousel.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Play className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">Continue Watching</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-red-500 to-transparent"></div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollCarousel("left")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollCarousel("right")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          id="continue-watching-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {continueItems.map((item) => (
            <div
              key={item._id}
              className="flex-none w-40 group cursor-pointer"
              onMouseEnter={() => setHoveredCard(item._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glass Container */}
              <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "/api/placeholder/160/240"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${item.watchProgress}%` }}
                    ></div>
                  </div>

                  {/* Hover Overlay */}
                  {hoveredCard === item._id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors duration-200">
                        <Play className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* Progress Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">{item.watchProgress}%</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 space-y-2">
                  <div>
                    <h4 className="font-semibold text-white text-xs group-hover:text-red-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <span className="capitalize">{item.mediaType}</span>
                      {item.releaseDate && (
                        <>
                          <span>•</span>
                          <span>{new Date(item.releaseDate).getFullYear()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.watchProgress}% watched</span>
                  </div>

                  {/* Resume Button */}
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" />
                    Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
