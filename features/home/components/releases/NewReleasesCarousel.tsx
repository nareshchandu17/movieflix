"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Calendar, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api as tmdbApi } from "@/lib/api";
import { TMDBMovie } from "@/lib/types";

interface NewReleasesCarouselProps {
  title?: string;
  subtitle?: string;
}

export default function NewReleasesCarousel({ title = "New Releases", subtitle = "Recently Added" }: NewReleasesCarouselProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        const response = await tmdbApi.getNowPlaying('movie', 1);
        setMovies(response.results as TMDBMovie[]);
      } catch (err) {
        console.error('Failed to fetch new releases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewReleases();
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

  if (loading && movies.length === 0) {
    return (
      <div className="py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 bg-green-500 rounded-full" />
          <div className="w-48 h-8 bg-white/5 rounded" />
        </div>
        <div className="flex gap-4 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] aspect-[2/3] bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="relative group/section py-8">
      {/* Header - Consistent Alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              {title}
            </h2>
           
          </div>
        </div>
      </div>

      {/* Full-Bleed Scroll Track */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[180px] md:w-[220px] aspect-[2/3] snap-start group/card relative"
            >
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-white/5 group-hover/card:border-green-500/30"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <Image
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80'}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 180px, 220px"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="px-1.5 py-0.5 bg-green-600 rounded text-[9px] font-black text-white uppercase">New</span>
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-white font-bold text-sm line-clamp-1 group-hover/card:text-green-400 transition-colors">
                    {movie.title}
                  </h3>
                  
                  {/* Action UI */}
                  <div className="flex items-center gap-3 mt-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <button className="flex-1 bg-white hover:bg-green-500 text-black hover:text-white py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
