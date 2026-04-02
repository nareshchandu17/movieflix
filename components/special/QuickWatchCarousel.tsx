"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Star, Calendar, Clock } from "lucide-react";
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
        
        // Fetch movies and filter for under 2 hours (120 minutes)
        const pagePromises: Promise<TMDBMovieResponse>[] = [];
        for (let page = 1; page <= 3; page++) {
          pagePromises.push(
            api.getMedia("movie", { 
              category: "popular", 
              page,
              sortBy: "popularity.desc"
            })
          );
        }
        
        const responses = await Promise.all(pagePromises);
        const allMovies: TMDBMovie[] = [];
        
        responses.forEach(response => {
          allMovies.push(...response.results);
        });
        
        // We'll need to get detailed movie info to check runtime
        // For now, we'll simulate by taking popular movies (in real app, you'd fetch detailed info)
        const quickWatchMovies = allMovies
          .filter(movie => movie.popularity > 10) // Popular movies
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 20);
        
        setQuickWatch(quickWatchMovies);
        
      } catch (err) {
        console.error("Error fetching quick watch movies:", err);
        setError("Failed to load quick watch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchQuickWatch();
  }, []);

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

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    
    const scrollAmount = cardWidth * 2 + 12;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
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
      

      {/* Full-Bleed Scroll Container */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="relative group">
          {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
            <Clock className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Quick Watch (Under 2 hrs)</h2>
            <p className="text-gray-400">Modern users love this - Perfect for a quick movie fix</p>
          </div>
        </div>
        
        <Link 
          href="/quick-watch"
          className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors duration-300 group"
        >
          <span className="text-sm font-medium">Browse All</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-green-500/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-green-500/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scroll Container */}
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Skeleton Loaders
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse border border-gray-700/50" />
                </div>
              ))
            ) : (
              quickWatch.map((movie, index) => (
                <div key={`${movie.id}-${index}`} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                  <div className="relative group/movie-card">
                    <EnhancedMediaCard
                      media={movie}
                      className="group/movie-card"
                    />
                    {/* Quick Watch Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                      ⚡ Quick
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="flex-shrink-0 w-12 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickWatchCarousel;
