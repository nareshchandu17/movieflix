"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface BecauseYouWatchedSeriesProps {
  title?: string;
  watchedShowName?: string;
}

export default function BecauseYouWatchedSeries({ title = "Because You Watched", watchedShowName }: BecauseYouWatchedSeriesProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch similar series based on watched show
  useEffect(() => {
    const fetchSimilarSeries = async () => {
      try {
        setLoading(true);
        
        // Get similar series based on genre and popularity
        const responses = await Promise.all([
          api.discover('tv', { genre: '18', sortBy: 'popularity.desc', page: 1 }), // Drama
          api.discover('tv', { genre: '80', sortBy: 'vote_average.desc', page: 1 }), // Crime
          api.discover('tv', { genre: '53', sortBy: 'popularity.desc', page: 1 }), // Thriller
          api.getTrending("tv", "week", 1)
        ]);

        // Combine and get similar content
        const allSeries = [
          ...(responses[0].results as TMDBTVShow[] || []),
          ...(responses[1].results as TMDBTVShow[] || []),
          ...(responses[2].results as TMDBTVShow[] || []),
          ...(responses[3].results as TMDBTVShow[] || [])
        ];

        // Remove duplicates and get top recommendations
        const uniqueSeries = Array.from(
          new Map(allSeries.map(show => [show.id, show])).values()
        ).slice(0, 8);

        setSeries(uniqueSeries);
      } catch (error) {
        console.error('Failed to fetch similar series:', error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarSeries();
  }, [watchedShowName]);

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
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {watchedShowName && <span className="text-2xl font-bold text-red-400">{watchedShowName}</span>}
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
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {watchedShowName && <span className="text-2xl font-bold text-red-400">{watchedShowName}</span>}
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4
                     pl-6 md:pl-12 lg:pl-20 pr-0
                     -mr-[50vw] w-[calc(100vw+50vw)]"
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
          {series.map((show, index) => (
            <motion.div
              key={`${show.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start group/card"
              style={{ width: '280px' }}
            >
              <div
                className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-gray-900"
                onClick={() => router.push(`/series/${show.id}`)}
              >
                {/* IMAGE */}
                <Image
                  src={
                    show.poster_path
                      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                      : "/placeholder-series.jpg"
                  }
                  alt={show.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                  sizes="280px"
                />

                {/* DARK GRADIENT (BASE) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* 🔥 HOVER OVERLAY (NETFLIX STYLE) */}
                <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                  
                  {/* Extra dark on hover */}
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                  {/* CONTENT */}
                  <div className="absolute bottom-0 p-4 w-full">
                    
                    {/* TITLE */}
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {show.name}
                    </h3>

                    {/* SUBTEXT */}
                    <p className="text-xs text-gray-300 mt-1">
                      {show.first_air_date
                        ? new Date(show.first_air_date).getFullYear()
                        : "N/A"}
                      {show.original_language && (
                        <span className="ml-2 uppercase">
                          • {show.original_language}
                        </span>
                      )}
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 mt-3">
                      
                      {/* PLAY */}
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-md hover:bg-gray-200 transition">
                        <Play className="w-3 h-3" />
                        Play
                      </button>

                      {/* ADD */}
                      <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 text-white hover:bg-white hover:text-black transition">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* BADGE */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  SIMILAR
                </div>

                {/* RATING */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-semibold">
                      {show.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* RIGHT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
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
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
