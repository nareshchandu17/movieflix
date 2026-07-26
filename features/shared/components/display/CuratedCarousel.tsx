"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import EnhancedMediaCard from "./EnhancedMediaCard";
import { fetchCuratedSection } from "@/lib/curation/sectionFetchers";
import { CurationOptions, MediaItem } from "@/lib/curation/engine";

interface CuratedCarouselProps {
  sectionId: string;
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  options?: CurationOptions;
  className?: string;
}

export default function CuratedCarousel({
  sectionId,
  title,
  subtitle,
  seeAllHref,
  options,
  className = "",
}: CuratedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(200);

  useEffect(() => {
    const updateCardWidth = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width >= 768) setCardWidth(200);
      else if (width >= 640) setCardWidth(180);
      else setCardWidth(160);
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["curated-carousel", sectionId, options],
    queryFn: () => fetchCuratedSection(sectionId, options),
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
  });

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = cardWidth * 3 + 48;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (error) {
    console.error(`[CuratedCarousel] Error loading section ${sectionId}:`, error);
    return null;
  }

  // Skeleton loading state with polished OTT feel
  if (isLoading && items.length === 0) {
    return (
      <div className={`py-6 sm:py-8 ${className}`}>
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 sm:h-8 bg-red-600 rounded-full animate-pulse" />
            <div className="w-44 sm:w-56 h-7 sm:h-8 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-[160px] sm:w-[180px] md:w-[200px] h-[240px] sm:h-[270px] md:h-[300px] bg-gradient-to-br from-white/10 to-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && items.length === 0) return null;

  return (
    <section
      className={`relative group/section py-5 sm:py-7 ${className}`}
      aria-label={title}
      role="region"
    >
      {/* Header Controls */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-4 flex items-end justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-1.5 h-7 sm:h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full shadow-lg shadow-red-600/30" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {title}
              </h2>
              {subtitle && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  <Sparkles className="w-3 h-3" />
                  {subtitle}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="sm:hidden text-xs text-neutral-400 mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group/link mr-2"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1 text-red-500" />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full bg-neutral-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-800 hover:border-white/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full bg-neutral-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-800 hover:border-white/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth px-4 sm:px-6 md:px-12 lg:px-20 pb-4 pt-1 snap-x snap-mandatory"
      >
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex-none w-[160px] sm:w-[180px] md:w-[200px] snap-start"
          >
            <EnhancedMediaCard media={item} variant="horizontal" />
          </div>
        ))}
      </div>
    </section>
  );
}
