"use client";

import { useState } from "react";
import { Play, Clock, ChevronLeft, ChevronRight, History } from "lucide-react";

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

interface RecentlyWatchedProps {
  items: CollectionItem[];
}

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  }
};

export default function RecentlyWatched({ items }: RecentlyWatchedProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Only show items that are fully watched and have a lastWatchedAt date
  const recentItems = items.filter(item => item.watched && item.lastWatchedAt);

  if (recentItems.length === 0) {
    return null;
  }

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = document.getElementById("recently-watched-carousel");
    if (carousel) {
      const scrollAmount = 220; // Card width + gap
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
            <div className="p-2 bg-gray-600 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Recently Watched</h2>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-500 to-transparent"></div>
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
          id="recently-watched-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recentItems.map((item) => (
            <div
              key={item._id}
              className="flex-none w-44 group cursor-pointer"
              onMouseEnter={() => setHoveredCard(item._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glass Container */}
              <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-500/50 hover:shadow-[0_0_25px_rgba(107,114,128,0.3)]">
                
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "/api/placeholder/176/264"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay */}
                  {hoveredCard === item._id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors duration-200">
                        <Play className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* Watched Badge */}
                  <div className="absolute top-2 left-2 bg-gray-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">Watched</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-gray-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
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
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      {item.lastWatchedAt ? getRelativeTime(item.lastWatchedAt) : "Recently"}
                    </div>
                    {item.voteAverage && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>⭐</span>
                        <span>{item.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
