"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import EnhancedMediaCard from "../display/EnhancedMediaCard";
import SectionHeader from "../layout/SectionHeader";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Extended type for trending items that includes media_type
interface TrendingItem extends TMDBMovie, TMDBTVShow {
  media_type: "movie" | "tv";
}

interface TrendingNowProps {
  title?: string;
  timeWindow?: "day" | "week";
}

const TrendingNow = ({ 
  title = "Trending Now", 
  timeWindow = "day" 
}: TrendingNowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200); // Default width

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

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getTrending("all", timeWindow, 1);
        // The TMDB API for trending/all includes media_type field
        setData(response.results as TrendingItem[]);
      } catch (err) {
        setError("Failed to load trending content");
        console.error("Error fetching trending data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, [timeWindow]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Section Header */} 
        <SectionHeader title={title}>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400">The hottest movies and shows everyone's watching</p>
          </div>
          <Link 
            href="/trending"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </SectionHeader>

        {/* Full-Bleed Scroll Container */}
        <div className="relative left-0 right-1/2 -mr-[5vw] w-[calc(100vw+2rem)]">
          <div className="relative group">
            {/* Navigation Buttons */}
            <button
              onClick={scrollLeft}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
          {isLoading ? (
            // Skeleton Loaders
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-shrink-0 snap-start"
                style={{
                  width: `${cardWidth}px`,
                }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-700 animate-pulse rounded" />
                    <div className="w-1/2 h-3 bg-gray-700 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            data.map((item) => (
              <div
                key={`${item.media_type}-${item.id}`}
                className="flex-shrink-0 snap-start"
                style={{
                  width: `${cardWidth}px`,
                }}
              >
                <EnhancedMediaCard
                  media={item}
                  variant="horizontal"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default TrendingNow;
