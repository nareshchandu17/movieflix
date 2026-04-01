"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface NewForYouGridProps {
  media: (TMDBMovie | TMDBTVShow)[];
}

const NewForYouGrid = ({ media }: NewForYouGridProps) => {
  const [visibleCount, setVisibleCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate personalized content based on user preferences
  const personalizedMedia = media.slice(0, 30).sort((a, b) => {
    // Simulate personalization score
    const scoreA = Math.random() * 100;
    const scoreB = Math.random() * 100;
    return scoreB - scoreA;
  });

  const loadMore = async () => {
    setIsLoading(true);
    // Simulate loading more personalized content
    await new Promise(resolve => setTimeout(resolve, 1000));
    setVisibleCount(prev => Math.min(prev + 10, personalizedMedia.length));
    setIsLoading(false);
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

  useEffect(() => {
    // Simulate real-time personalization updates
    const interval = setInterval(() => {
      // Shuffle a few items to simulate dynamic personalization
      if (Math.random() > 0.7) {
        const shuffled = [...personalizedMedia];
        const randomIndex = Math.floor(Math.random() * 5);
        const temp = shuffled[randomIndex];
        shuffled[randomIndex] = shuffled[randomIndex + 5] || temp;
        shuffled[randomIndex + 5] = temp;
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [personalizedMedia]);

  if (!personalizedMedia || personalizedMedia.length === 0) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#3B82F6]" />
          <div>
            <h3 className="text-3xl font-bold text-[#F9FAFB]">New For You</h3>
            <p className="text-[#9CA3AF] text-sm mt-1">Personalized recommendations based on your viewing history</p>
          </div>
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

      {/* Grid Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {personalizedMedia.slice(0, visibleCount).map((item, index) => (
            <MediaCard
              key={`for-you-${item.id}`}
              media={item}
              index={index}
              layout="grid"
            />
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {visibleCount < personalizedMedia.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="bg-[#3B82F6] hover:bg-blue-600 disabled:bg-blue-800 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading More...
              </>
            ) : (
              <>
                Load More ({personalizedMedia.length - visibleCount} remaining)
              </>
            )}
          </button>
        </div>
      )}

      {/* Personalization Indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI-powered recommendations updated in real-time</span>
        </div>
      </div>
    </div>
  );
};

export default NewForYouGrid;
