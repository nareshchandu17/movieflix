"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Star, Calendar, Film } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";
import { useRouter } from "next/navigation";

interface HollywoodMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_count: number;
  media_type: 'movie';
}

const PopularHollywoodCarousel = () => {
  const [hollywoodMovies, setHollywoodMovies] = useState<HollywoodMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  useEffect(() => {
    const fetchHollywoodMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Hollywood/English movies with multiple pages for variety
        const pagePromises: Promise<TMDBMovieResponse>[] = [];
        for (let page = 1; page <= 4; page++) {
          pagePromises.push(
            api.getMedia("movie", { 
              category: "popular", 
              page,
              sortBy: "popularity.desc"
            })
          );
        }
        
        const responses = await Promise.all(pagePromises);
        const allHollywoodMovies: HollywoodMovie[] = [];
        
        responses.forEach(response => {
          const moviesWithMediaType = response.results.map(movie => ({ 
            ...movie, 
            media_type: 'movie' as const 
          }));
          allHollywoodMovies.push(...moviesWithMediaType);
        });
        
        // Deduplicate movies by ID
        const uniqueMovies = allHollywoodMovies.filter((movie, index, self) => 
          index === self.findIndex((m) => m.id === movie.id)
        );
        
        // Shuffle for variety and take top 20
        const shuffled = uniqueMovies.sort(() => Math.random() - 0.5);
        setHollywoodMovies(shuffled.slice(0, 20));
        
      } catch (err) {
        console.error("Error fetching Hollywood movies:", err);
        setError("Failed to load Hollywood movies");
      } finally {
        setLoading(false);
      }
    };

    fetchHollywoodMovies();
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-blue-500/20 border border-red-500/30">
            <Film className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular in Hollywood</h2>
            <p className="text-gray-400">Blockbuster movies from Hollywood studios</p>
          </div>
        </div>
        
        <Link 
          href="/hollywood"
          className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
        >
          <span className="text-sm font-medium">Browse All</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
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
              hollywoodMovies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                  <EnhancedMediaCard
                    media={movie}
                    className="group/movie-card"
                  />
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

export default PopularHollywoodCarousel;
