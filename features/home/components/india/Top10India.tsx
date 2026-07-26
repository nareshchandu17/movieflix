"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, TrendingUp, Info, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie } from "@/lib/types";
import { api as tmdbApi } from "@/lib/api";

interface Top10IndiaProps {
  title?: string;
}

export default function Top10India({ title = "Top 10 in India Today" }: Top10IndiaProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTopIndianMovies = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all([
          tmdbApi.discover('movie', { language: 'hi', sortBy: 'popularity.desc', page: 1 }),
          tmdbApi.discover('movie', { language: 'te', sortBy: 'vote_average.desc', page: 1 }),
          tmdbApi.discover('movie', { language: 'ta', sortBy: 'vote_count.desc', page: 1 }),
        ]);

        const allMovies = [
          ...(responses[0].results as TMDBMovie[] || []),
          ...(responses[1].results as TMDBMovie[] || []),
          ...(responses[2].results as TMDBMovie[] || []),
        ];

        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        ).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 10);

        setMovies(uniqueMovies);
      } catch (error) {
        console.error('Failed to fetch top Indian movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopIndianMovies();
  }, []);

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
    <div className="relative group/section py-6">
      {/* Header with consistent left alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-white/90 flex items-center gap-2 group cursor-pointer">
            {title}
            <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-orange-500" />
          </h2>
          <span className="hidden sm:block text-[10px] md:text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest">
            India Top 10
          </span>
        </div>
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
          className="flex gap-12 md:gap-16 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '8rem' }}
        >
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[180px] md:w-[220px] aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />
            ))
          ) : (
            movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 flex items-end snap-start group/card relative"
              >
                {/* Large Rank Number - Netflix Style */}
                <div className="absolute -left-10 md:-left-12 bottom-0 z-0">
                   <span className="text-[120px] md:text-[180px] font-black leading-none text-transparent select-none"
                         style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)', transition: 'all 0.5s ease' }}>
                    {index + 1}
                  </span>
                </div>

                {/* Hotstar Style Portrait Card */}
                <div 
                  className="relative w-[140px] md:w-[180px] aspect-[2/2.8] rounded-lg overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_30px_rgba(249,115,22,0.3)] border border-white/5 group-hover/card:border-orange-500/50 z-10"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <Image
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg'}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    sizes="(max-width: 768px) 140px, 180px"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                      </div>
                      <div className="flex-1" />
                      <button className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Top 10 Corner Ribbon or Badge */}
                  <div className="absolute top-0 left-0 bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-br shadow-lg">
                    TOP 10
                  </div>
                </div>

                {/* Movie Meta - Positioned with a bit of offset to avoid overlapping with number legibly */}
                <div className="absolute -bottom-14 left-0 right-0 px-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white/90 font-medium text-xs line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
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
