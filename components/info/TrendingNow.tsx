"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import EnhancedMediaCard from "../display/EnhancedMediaCard";
import { ChevronRight, ChevronLeft } from "lucide-react";

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
  const [cardWidth, setCardWidth] = useState(200);

  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) setCardWidth(200);
      else if (width >= 640) setCardWidth(180);
      else setCardWidth(160);
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getTrending("all", timeWindow, 1);
        setData(response.results as TrendingItem[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load trending content");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendingData();
  }, [timeWindow]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = cardWidth * 2 + 12;
    const container = scrollContainerRef.current;
    const startTime = performance.now();
    const startX = container.scrollLeft;
    const targetX = startX + (dir === "left" ? -scrollAmount : scrollAmount);
    const duration = 400;
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      container.scrollLeft = startX + (targetX - startX) * easeInOutCubic;
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  };

  if (error) {
    return (
      <div className="pl-4 sm:pl-6 md:pl-12 lg:pl-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* HEADER WITH LEFT PADDING */}
      <div className="pl-4 sm:pl-6 md:pl-12 lg:pl-20 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        </div>
        <Link
          href="/trending"
          className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300"
        >
          <span className="text-sm font-medium">See All</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 hover:translate-x-1" />
        </Link>
      </div>

      {/* CAROUSEL FULL-BLEED WITH LEFT PADDING */}
      <div className="relative pl-4 sm:pl-6 md:pl-12 lg:pl-20">
        {/* LEFT SCROLL BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition z-20"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT SCROLL BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition z-20"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4"
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />

          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : data.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <EnhancedMediaCard media={item} variant="horizontal" />
                </div>
              ))}

          {/* RIGHT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default TrendingNow;