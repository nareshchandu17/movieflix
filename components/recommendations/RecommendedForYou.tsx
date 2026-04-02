"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, TrendingUp, Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie } from "@/lib/types";
import { api as tmdbApi } from "@/lib/api";

interface RecommendedForYouProps {
  title?: string;
  userName?: string;
}

export default function RecommendedForYou({ title = "Recommended For You", userName }: RecommendedForYouProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all([
          tmdbApi.discover('movie', { sortBy: 'popularity.desc', page: 1 }),
          tmdbApi.discover('movie', { genre: '28', sortBy: 'vote_average.desc', page: 1 }),
          tmdbApi.getTrending('movie', 'day', 1),
        ]);

        const allMovies = [
          ...(responses[0].results as TMDBMovie[] || []),
          ...(responses[1].results as TMDBMovie[] || []),
          ...(responses[2].results as TMDBMovie[] || []),
        ];

        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        ).slice(0, 15);

        setMovies(uniqueMovies);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userName]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!loading && movies.length === 0) return null;

  return (
    <div className="relative group/section py-4">
      {/* Header with consistent left alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white/90 flex items-center gap-2 group cursor-pointer">
          {title}
          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-purple-500" />
        </h2>
        {userName && (
          <span className="text-xs md:text-sm font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Picks for {userName}
          </span>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px] md:w-[200px] aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />
            ))
          ) : (
            movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[160px] md:w-[200px] snap-start group/card"
              >
                {/* Hotstar Style Portrait Card */}
                <div 
                  className="relative aspect-[2/2.8] rounded-lg overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-white/5 group-hover/card:border-purple-500/50"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <Image
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg'}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    sizes="(max-width: 768px) 160px, 200px"
                  />
                  
                  {/* Premium Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                      </div>
                      <div className="flex-1" />
                      <button className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10 group-hover/card:border-purple-500/50 transition-colors">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-bold text-white">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>

                {/* Movie Meta */}
                <div className="mt-3 px-1">
                  <h3 className="text-white/90 font-medium text-xs md:text-sm line-clamp-1 group-hover/card:text-white transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-500 mt-1">
                    <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span className="uppercase">{movie.original_language || 'EN'}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
