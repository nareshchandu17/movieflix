"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useCategoryData } from "@/lib/hooks";
import MediaCard from "../display/MediaCard";
import EnhancedMediaCard from "../display/EnhancedMediaCard";
import SectionHeader from "../layout/SectionHeader";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CategorySectionProps {
  title: string;
  mediaType: "movie" | "tv";
  category:
    | "popular"
    | "top_rated"
    | "now_playing"
    | "upcoming"
    | "on_the_air"
    | "airing_today";
  seeAllHref: string;
}

const CategorySection = ({
  title,
  mediaType,
  category,
  seeAllHref,
}: CategorySectionProps) => {
  const page = 1;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useCategoryData(mediaType, category, page);

  const results: (TMDBMovie | TMDBTVShow)[] = data?.results || [];
  const hasError = !!error;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth =
        window.innerWidth >= 768 ? 200 : window.innerWidth >= 640 ? 180 : 160;
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
      const cardWidth =
        window.innerWidth >= 768 ? 200 : window.innerWidth >= 640 ? 180 : 160;
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (hasError) {
    return (
      <div className="w-full">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const showEmptyState = results.length === 0;

  let displayData: (TMDBMovie | TMDBTVShow)[];

  if (hasError) {
    console.warn(
      `CategorySection API error for ${mediaType}/${category}:`,
      error
    );
    displayData = [];
  } else {
    displayData = results;
  }

  return (
    <div className="mb-12 bg-black">
      <SectionHeader title={title}>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        </div>
        <Link href={seeAllHref} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group">
          <span className="text-sm font-medium">See All</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </SectionHeader>

      {showEmptyState ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p className="text-lg">
            No {mediaType === "movie" ? "movies" : "TV shows"} available at
            the moment.
          </p>
          <p className="text-sm">
            Please check your internet connection and try again
          </p>
        </div>
      ) : (
        <div className="relative left-0 right-1/2 -mr-[5vw] w-[calc(100vw+2rem)]">
          <div className="relative section-hover">
            <button
              onClick={scrollLeft}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:scale-110 chevron-btn-left border border-white/20"
              aria-label="Scroll left"
            >
            
            </button>

            <div
              onClick={scrollRight}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:scale-110 chevron-btn-right border border-white/20"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </div>

            <div
              ref={scrollContainerRef}
              className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide horizontal-scroll touch-scroll px-6"
            >
            {displayData.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 scroll-snap-align-start"
              >
                <EnhancedMediaCard media={item} variant="horizontal" />
              </div>
            ))}
            {/* Add some padding at the end for better mobile scrolling */}
            <div className="flex-shrink-0 w-4 sm:w-6"></div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategorySection;
