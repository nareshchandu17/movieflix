"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";

const QuickWatchCarousel = () => {
  const [quickWatch, setQuickWatch] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuickWatch = async () => {
      try {
        setLoading(true);
        setError(null);

        const pagePromises: Promise<TMDBMovieResponse>[] = [];
        for (let page = 1; page <= 3; page++) {
          pagePromises.push(
            api.getMedia("movie", {
              category: "popular",
              page,
              sortBy: "popularity.desc",
            })
          );
        }

        const responses = await Promise.all(pagePromises);
        const allMovies: TMDBMovie[] = [];

        responses.forEach((res) => allMovies.push(...res.results));

        const quickWatchMovies = allMovies
          .filter((m) => m.popularity > 10)
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 20);

        setQuickWatch(quickWatchMovies);
      } catch (err) {
        setError("Failed to load quick watch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchQuickWatch();
  }, []);

  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) setCardWidth(200);
      else if (width >= 640) setCardWidth(180);
      else setCardWidth(150);
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = cardWidth * 2 + 8; // reduced gap sync

    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* HEADER (NO ICON) */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Quick Watch (Under 2 hrs)
            </h2>
          </div>

          <Link
            href="/quick-watch"
            className="flex items-center gap-2 text-green-500 hover:text-green-400 transition"
          >
            <span className="text-sm font-medium">Browse All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED */}
      <div className="relative">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-600/80 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-600/80 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SCROLL */}
        <div
          ref={carouselRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : quickWatch.map((movie, index) => (
                <div
                  key={`${movie.id}-${index}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  {/* INDIVIDUAL HOVER */}
                  <div className="relative hover:scale-105 transition-transform duration-300">
                    <EnhancedMediaCard media={movie} />

                    {/* Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 rounded-full backdrop-blur-sm">
                      ⚡ Quick
                    </div>
                  </div>
                </div>
              ))}

          {/* END SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default QuickWatchCarousel;