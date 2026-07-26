"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewReleasesGridProps {
  media: (TMDBMovie | TMDBTVShow)[];
}

const NewReleasesGrid = ({ media }: NewReleasesGridProps) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, media.length));
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 500;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="relative">

      {/* Carousel Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.slice(0, visibleCount).map((item, index) => (
            <div key={item.id} className="flex-shrink-0 w-36 md:w-40 lg:w-44">
              <MediaCard
                media={item}
                index={index}
                layout="grid"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {visibleCount < media.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-blue-400/20 text-sm"
          >
            Load More ({media.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default NewReleasesGrid;
