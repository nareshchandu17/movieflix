"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, TrendingUp, Calendar, Bell, Plus, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

interface Top10IndiaProps {
  title?: string;
}

export default function Top10India({ title = "Top 10 in India Today" }: Top10IndiaProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch top Indian movies
  useEffect(() => {
    const fetchTopIndianMovies = async () => {
      try {
        setLoading(true);
        
        // Get Indian movies with high metrics
        const responses = await Promise.all([
          api.discover('movie', { 
            with_original_language: 'hi', // Hindi movies
            with_genres: '18,36,10751', // Drama, History, Family
            sortBy: 'popularity.desc', 
            page: 1 
          }),
          api.discover('movie', { 
            with_original_language: 'te', // Telugu movies
            with_genres: '28,12', // Action, Adventure
            sortBy: 'vote_average.desc', 
            page: 1 
          }),
          api.discover('movie', { 
            with_original_language: 'ta', // Tamil movies
            with_genres: '18,53', // Drama, Thriller
            sortBy: 'vote_count.desc', 
            page: 1 
          }),
          api.discover('movie', { 
            with_original_language: 'ml', // Malayalam movies
            with_genres: '28,35', // Action, Comedy
            sortBy: 'popularity.desc', 
            page: 1 
          })
        ]);

        // Combine all Indian movies
        const allMovies = [
          ...(responses[0].results as TMDBMovie[] || []),
          ...(responses[1].results as TMDBMovie[] || []),
          ...(responses[2].results as TMDBMovie[] || []),
          ...(responses[3].results as TMDBMovie[] || [])
        ];

        // Remove duplicates and sort by combined metrics
        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        ).sort((a, b) => {
          // Combined score: popularity + vote_average * 1000 + vote_count
          const scoreA = (a.popularity || 0) + (a.vote_average || 0) * 1000 + (a.vote_count || 0);
          const scoreB = (b.popularity || 0) + (b.vote_average || 0) * 1000 + (b.vote_count || 0);
          return scoreB - scoreA;
        }).slice(0, 12);

        setMovies(uniqueMovies);
      } catch (error) {
        console.error('Failed to fetch top Indian movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopIndianMovies();
  }, []);

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
          <div className="w-1 h-8 bg-orange-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="text-sm text-orange-400">High Engagement</span>
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
        <div className="w-1 h-8 bg-orange-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="text-sm text-orange-400">High Engagement</span>
      </div>

      <div className="relative group">
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
                    className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center"
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Rank Badge */}
                <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  #{index + 1}
                </div>

                {/* Engagement Metrics */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span className="text-white font-semibold">{movie.vote_average?.toFixed(1)}</span>
                      <span className="text-gray-400">★</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{movie.popularity?.toFixed(0)}</span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {movie.vote_count?.toLocaleString()} votes
                    </div>
                  </div>
                </div>
              </div>

              {/* Movie Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{movie.original_language?.toUpperCase() || 'EN'}</span>
                  </div>
                  <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-600 hover:border-orange-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-600 hover:border-orange-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
