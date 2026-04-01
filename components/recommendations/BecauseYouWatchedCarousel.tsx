"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

interface BecauseYouWatchedCarouselProps {
  movieName: string;
  movieId?: string;
}

export default function BecauseYouWatchedCarousel({ movieName, movieId }: BecauseYouWatchedCarouselProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch similar/recommended movies based on the watched movie
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        if (movieId) {
          // If we have a specific movie ID, get similar movies
          const response = await api.discover('movie', { genre: '28,12,53', sortBy: 'popularity.desc', page: 1 });
          const similarMovies = (response.results as TMDBMovie[]) || [];
          setMovies(similarMovies.slice(0, 12));
        } else {
          // Fallback: get popular movies as recommendations
          const response = await api.discover('movie', { sortBy: 'popularity.desc', page: 1 });
          const popularMovies = (response.results as TMDBMovie[]) || [];
          setMovies(popularMovies.slice(0, 12));
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        // Fallback to empty array
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (movieName) {
      fetchRecommendations();
    }
  }, [movieName, movieId]);

  const nextSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(movies.length / 6)) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
    // Update button visibility logic here if needed
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 280 + 16; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth * 6,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">
            Because You Watched <span className="text-red-500">{movieName}</span>
          </h2>
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '280px' }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-red-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">
          Because You Watched <span className="text-red-500">{movieName}</span>
        </h2>
      </div>

      <div className="relative group">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
          onScroll={updateScrollButtons}
          style={{ scrollPaddingLeft: "3rem" }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '280px' }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => useRouter().push(`/movie/${movie.id}`)}>
                <Image
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="280px"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center"
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </motion.div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs font-semibold">
                      {movie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Movie Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  {movie.original_language && movie.original_language !== 'en' && (
                    <span className="ml-2 uppercase">• {movie.original_language}</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
