"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const DramaCarousel = () => {
  const [dramaMovies, setDramaMovies] = useState<(TMDBMovie & { media_type: 'movie' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  useEffect(() => {
    const fetchDramaMovies = async () => {
      try {
        // Drama genre ID: 18
        const allDramaMovies: (TMDBMovie & { media_type: 'movie' })[] = [];
        
        // Fetch multiple categories for comprehensive collection
        const fetchPromises = [
          // Latest drama movies
          api.getMedia("movie", { category: "popular", genre: "18", sortBy: "popularity.desc" }),
          // Top rated drama
          api.getMedia("movie", { category: "top_rated", genre: "18", sortBy: "vote_average.desc" }),
          // Now playing drama
          api.getMedia("movie", { category: "now_playing", genre: "18", sortBy: "popularity.desc" }),
          // Upcoming drama
          api.getMedia("movie", { category: "upcoming", genre: "18", sortBy: "popularity.desc" }),
        ];

        const responses = await Promise.all(fetchPromises);
        
        // Process all responses
        responses.forEach(response => {
          const moviesWithMediaType = response.results.map(movie => ({ 
            ...movie, 
            media_type: 'movie' as const 
          }));
          allDramaMovies.push(...moviesWithMediaType);
        });
        
        // Remove duplicates and sort by combined score (popularity + rating)
        const uniqueMovies = allDramaMovies.filter((movie, index, self) => 
          index === self.findIndex((m) => m.id === movie.id)
        ).map(movie => ({
          ...movie,
          score: (movie.popularity || 0) + ((movie.vote_average || 0) * 100) // Combined scoring with fallbacks
        }))
        .sort((a, b) => b.score - a.score) // Sort by combined score
        .slice(0, 250); // Limit to 250 movies
        
        setDramaMovies(uniqueMovies);
      } catch (error) {
        console.error("Error fetching drama movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramaMovies();
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
    if (carouselRef.current) {
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap

      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Drama</h2>
            <p className="text-gray-400">Emotional and thought-provoking dramas</p>
          </div>
        </div>
        
        {/* Full-Bleed Scroll Container */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
          <div className="relative group">
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="relative aspect-[2/3] bg-gray-700 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dramaMovies.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative group">
        

        {/* Full-Bleed Scroll Container */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          <div className="relative group">
            
            {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Drama</h2>
            <p className="text-gray-400">Emotional and thought-provoking dramas</p>
          </div>
          <Link 
            href="/movie?genre=drama"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
            <button
              onClick={() => scroll("left")}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dramaMovies.map((movie, index) => (
                <motion.div
                  key={`${movie.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 snap-start cursor-pointer"
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                    
                    {/* Individual hover overlay with 1-second delay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 delay-150">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{movie.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                          </div>
                          {movie.release_date && (
                            <span className="text-white/70 text-xs">
                              {new Date(movie.release_date).getFullYear()}
                            </span>
                          )}
                        </div>
                        
                        {/* Buttons with 75% and 25% width */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle play action
                            }}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play Now
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle add to watchlist
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="flex-shrink-0 w-12 md:w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DramaCarousel;
