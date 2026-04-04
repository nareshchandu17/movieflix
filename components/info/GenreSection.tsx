"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import EnhancedMediaCard from "../display/EnhancedMediaCard";
import SectionHeader from "../layout/SectionHeader";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface GenreSectionProps {
  title: string;
  mediaType: "movie" | "tv";
  genreId: number;
  seeAllHref?: string;
}

const GenreSection = ({
  title,
  mediaType,
  genreId,
  seeAllHref,
}: GenreSectionProps) => {
  const [data, setData] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch genre data
  useEffect(() => {
    const fetchGenreData = async () => {
      try {
        setLoading(true);
        const result = await api.getMedia(mediaType, {
          genre: genreId.toString(),
          page: 1,
          sortBy: "popularity.desc",
        });
        setData(result.results || []);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreData();
  }, [mediaType, genreId, title]);

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          </div>
          {seeAllHref && (
            <Link 
              href={seeAllHref}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">See All</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        
        {/* Full-Bleed Scroll Container */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
          <div className="relative group">
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          </div>
          {seeAllHref && (
            <Link 
              href={seeAllHref}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">See All</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Full-Bleed Scroll Container */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
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
          {data.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 snap-start"
              style={{ width: `${cardWidth}px` }}
            >
              <EnhancedMediaCard media={item} variant="horizontal" />
            </div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreSection;
