/**
 * @file components/display/MovieCarousel.tsx
 * @description STEP 10: Unified, Netflix-grade Reusable Movie/Series Carousel component.
 * Features lazy intersection-based allocation & fetching (`200px` margin), smooth horizontal GPU scroll,
 * responsive skeleton loading states, and elegant typography/controls.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import MediaCard from "@/features/home/components/newpopular/MediaCard";
import { StrategyName, NormalizedMediaItem, CurationOptions } from "@/services/content-engine/types";

export interface MovieCarouselProps {
  title: string;
  strategy: StrategyName;
  subtitle?: string;
  seeAllHref?: string;
  pageKey?: string;
  options?: CurationOptions;
  limit?: number;
  className?: string;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  strategy,
  subtitle,
  seeAllHref,
  pageKey = "global",
  options = {},
  limit = 20,
  className = "",
}) => {
  const [items, setItems] = useState<NormalizedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Scroll controls & IntersectionObserver
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const isMountedRef = useRef<boolean>(true);
  const hasFetchedRef = useRef<boolean>(false);
  const optionsString = JSON.stringify(options || {});

  const fetchCarouselContent = useCallback(async () => {
    if (hasFetchedRef.current || !isMountedRef.current) return;
    setLoading(true);
    setError(false);

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 60000);

    try {
      if (!isMountedRef.current) return;
      const res = await fetch("/api/content-engine/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy,
          limit,
          page: 1,
          pageKey,
          options: JSON.parse(optionsString),
        }),
        signal: controller.signal,
      });

      clearTimeout(abortTimeout);
      if (!isMountedRef.current) return;

      if (!res || !res.ok) {
        throw new Error(`Failed to allocate content (${res?.status || "Network Error"})`);
      }

      const data = await res.json();
      if (!isMountedRef.current) return;

      if (data && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems([]);
      }
      hasFetchedRef.current = true;
      setHasFetched(true);
    } catch (err: any) {
      clearTimeout(abortTimeout);
      if (err?.name === "AbortError" || !isMountedRef.current) {
        return;
      }
      console.warn(`[MovieCarousel] Could not load strategy "${strategy}": ${err?.message || String(err)}`);
      setError(true);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [strategy, limit, pageKey, optionsString]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Lazy loading via IntersectionObserver
  useEffect(() => {
    if (!containerRef.current || hasFetchedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasFetchedRef.current && isMountedRef.current) {
          fetchCarouselContent();
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fetchCarouselContent]);

  // Handle scroll arrow visibility
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Skeleton placeholders while loading
  const renderSkeletons = () => (
    <div className="flex gap-4 sm:gap-6 overflow-hidden py-4 px-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="w-[160px] sm:w-[180px] md:w-[200px] h-[240px] sm:h-[270px] md:h-[300px] flex-shrink-0 rounded-xl bg-gray-800/60 animate-pulse border border-gray-700/30"
        />
      ))}
    </div>
  );

  // If fetched and empty or errored, show a fallback state instead of completely collapsing
  if ((hasFetched || error) && !loading && items.length === 0) {
    return (
      <section className={`py-3 sm:py-4 relative group min-h-[340px] ${className}`}>
        <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-600 tracking-tight drop-shadow-md">
                {title}
              </h2>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full h-[240px] sm:h-[270px] md:h-[300px] flex items-center justify-center rounded-xl bg-gray-900/30 border border-gray-800/50">
            <p className="text-gray-500 font-medium">Content currently unavailable</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-3 sm:py-4 relative group ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <span>See All</span>
            <ArrowRight className="w-4 h-4 text-red-500" />
          </Link>
        )}
      </div>

      {/* Carousel Track Container */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        {/* Left Arrow */}
        {showLeftArrow && !loading && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-4 px-1 -mx-1 select-none"
          style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        >
          {loading ? (
            renderSkeletons()
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="flex-shrink-0 transform transition-transform duration-300 hover:z-20"
              >
                <MediaCard
                  media={item as any}
                  index={index}
                  layout="carousel"
                />
              </div>
            ))
          )}
        </div>

        {/* Right Arrow */}
        {showRightArrow && !loading && items.length > 4 && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
};

export default MovieCarousel;
