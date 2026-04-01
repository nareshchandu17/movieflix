"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

interface TrendingCarouselProps {
  media: (TMDBMovie | TMDBTVShow)[];
}

const TrendingCarousel = ({ media }: TrendingCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 640;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 448; // w-[28rem]
      const gap = 24; // gap-6
      const scrollPosition = index * (cardWidth + gap);
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    }
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[#E50914]" />
          <h3 className="text-3xl font-bold text-[#F9FAFB]">Trending Now</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 bg-[#1A2236] rounded-full flex items-center justify-center text-white hover:bg-[#0B1020] transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 bg-[#1A2236] rounded-full flex items-center justify-center text-white hover:bg-[#0B1020] transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, index) => (
            <MediaCard
              key={item.id}
              media={item}
              index={index}
              layout="carousel"
            />
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {media.slice(0, Math.min(10, media.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-[#E50914]"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
