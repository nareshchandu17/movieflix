"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, BarChart3, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface ContinueWatchingSeriesProps {
  title?: string;
}

export default function ContinueWatchingSeries({ title = "Continue Watching" }: ContinueWatchingSeriesProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock data for continue watching series
  useEffect(() => {
    const mockSeries: TMDBTVShow[] = [
      {
        id: 1234,
        name: "Breaking Bad",
        overview: "A high school chemistry teacher turned methamphetamine cook partners with a former student.",
        poster_path: "https://image.tmdb.org/t/p/w500/ggm1fb19179S9M9pS6v699yv69O.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/9fa92Mav7j9Ty2o9vRzY9m9cyas.jpg",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
        vote_count: 12000,
        genre_ids: [18, 80],
        adult: false,
        origin_country: ["US"],
        original_language: "en",
        original_name: "Breaking Bad",
        popularity: 450.5
      },
      {
        id: 5678,
        name: "Stranger Things",
        overview: "When a young boy disappears, his mother must confront terrifying supernatural forces.",
        poster_path: "https://image.tmdb.org/t/p/w500/49WJfev0moxR9p96p3YV4vDSYJu.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/56v2KjHUnYp3rS16S67AsY9U9S7.jpg",
        first_air_date: "2016-07-15",
        vote_average: 8.7,
        vote_count: 15000,
        genre_ids: [18, 9648, 10765],
        adult: false,
        origin_country: ["US"],
        original_language: "en",
        original_name: "Stranger Things",
        popularity: 380.2
      }
    ];
    
    setSeries(mockSeries);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '320px' }}
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
        <div className="w-1 h-8 bg-blue-600 rounded-full" />
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
              style={{ width: '320px' }}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => router.push(`/series/${show.id}`)}>
                <Image
                  src={show.poster_path || "https://i.imgur.com/wjVuAGb.png"}
                  alt={show.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="320px"
                  onError={(e) => {
                    // Fallback to a reliable placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.src = "https://i.imgur.com/wjVuAGb.png";
                  }}
                />

                {/* Progress Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: '75%' }} // Mock progress
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                    Episode 4
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                    32 min remaining
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </motion.div>
                </div>
              </div>

              {/* Series Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight mb-1">
                  {show.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>45 min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>75% complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
