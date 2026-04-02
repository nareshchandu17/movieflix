"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface TopPicksForYouProps {
  title?: string;
  userName?: string;
}

export default function TopPicksForYou({ title = "Top Picks for You", userName }: TopPicksForYouProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch personalized recommendations
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);
        
        // Mix of different recommendation strategies
        const responses = await Promise.all([
          api.getTrending("tv", "week", 1),
          api.getPopular("tv", 1),
          api.getTopRated("tv", 1),
          api.discover('tv', { genre: '18', sortBy: 'popularity.desc', page: 1 }) // High-rated drama
        ]);

        // Combine and deduplicate recommendations
        const allSeries = [
          ...(responses[0].results as TMDBTVShow[] || []),
          ...(responses[1].results as TMDBTVShow[] || []),
          ...(responses[2].results as TMDBTVShow[] || []),
          ...(responses[3].results as TMDBTVShow[] || [])
        ];

        // Remove duplicates and get top picks
        const uniqueSeries = Array.from(
          new Map(allSeries.map(show => [show.id, show])).values()
        ).slice(0, 8);

        setSeries(uniqueSeries);
      } catch (error) {
        console.error('Failed to fetch top picks:', error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, [userName]);

  const nextSlide = useCallback(() => {
    if (series.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(series.length / 4));
    }
  }, [series.length]);

  const prevSlide = useCallback(() => {
    if (series.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(series.length / 4)) % Math.ceil(series.length / 4));
    }
  }, [series.length]);

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-purple-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {userName && <span className="text-sm text-purple-400">for {userName}</span>}
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '280px' }}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden">
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

  if (series.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-purple-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {userName && <span className="text-sm text-purple-400">for {userName}</span>}
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
          style={{ scrollPaddingLeft: "3rem" }}
        >
          {series.map((show, index) => (
            <motion.div
              key={`${show.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '280px' }}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => router.push(`/series/${show.id}`)}>
                <Image
                  src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : '/placeholder-series.jpg'}
                  alt={show.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="280px"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center"
                  >
                    <Star className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* AI Pick Badge */}
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  AI PICK
                </div>

                {/* Rating & Popularity */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white font-semibold">{show.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{show.popularity?.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Series Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {show.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                  {show.original_language && show.original_language !== 'en' && (
                    <span className="ml-2 uppercase">• {show.original_language}</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 hover:border-purple-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 hover:border-purple-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
