"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface NewEpisodesThisWeekProps {
  title?: string;
}

export default function NewEpisodesThisWeek({ title = "New Episodes This Week" }: NewEpisodesThisWeekProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch ongoing shows with recent episodes
  useEffect(() => {
    const fetchNewEpisodes = async () => {
      try {
        setLoading(true);
        
        // Get ongoing shows and recently aired series
        const responses = await Promise.all([
          api.getTrending("tv", "week", 1),
          api.discover('tv', { sortBy: 'first_air_date.desc', page: 1 }),
          api.getPopular("tv", 1)
        ]);

        // Combine and filter for recent content
        const allSeries = [
          ...(responses[0].results as TMDBTVShow[] || []),
          ...(responses[1].results as TMDBTVShow[] || []),
          ...(responses[2].results as TMDBTVShow[] || [])
        ];

        // Filter for shows that have aired recently (within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentSeries = allSeries.filter(show => {
          if (!show.first_air_date) return false;
          const airDate = new Date(show.first_air_date);
          return airDate >= thirtyDaysAgo;
        }).slice(0, 8);

        setSeries(recentSeries);
      } catch (error) {
        console.error('Failed to fetch new episodes:', error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewEpisodes();
  }, []);

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

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo <= 7) return `${daysAgo} days ago`;
    return `${Math.ceil(daysAgo / 7)} weeks ago`;
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-green-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
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
        <div className="w-1 h-8 bg-green-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
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
                   onClick={() => useRouter().push(`/series/${show.id}`)}>
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
                    className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* New Episode Badge */}
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  NEW EP
                </div>

                {/* Days Ago Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="text-green-400 font-semibold">
                      {getDaysAgo(show.first_air_date)}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <BarChart3 className="w-3 h-3" />
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
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}</span>
                  <span className="text-green-400 font-semibold">
                    {show.first_air_date && getDaysAgo(show.first_air_date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600 hover:border-green-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600 hover:border-green-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
