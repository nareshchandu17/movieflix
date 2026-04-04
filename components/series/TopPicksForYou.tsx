"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, TrendingUp, Info } from "lucide-react";
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-purple-600 rounded-full" />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {userName && <span className="text-sm text-purple-400">for {userName}</span>}
          </div>
        </div>

        <div className="relative group">
          <div
            className="
              flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4
              
              /* FULL BLEED */
              -mx-[5vw] w-[calc(100%+10vw)]
              
              /* INTERNAL PADDING */
              px-[5vw]
            "
          >
            {/* LEFT SPACER */}
            <div className="flex-shrink-0 w-12 md:w-20" />
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
            {/* RIGHT SPACER */}
            <div className="flex-shrink-0 w-12 md:w-20" />
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {userName && <span className="text-sm text-purple-400">for {userName}</span>}
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4
            
            /* FULL BLEED */
            -mx-[5vw] w-[calc(100%+10vw)]
            
            /* INTERNAL PADDING */
            px-[5vw]
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />

  {series.map((show, index) => (
    <motion.div
      key={`${show.id}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 snap-start"
      style={{ width: '280px' }}
    >
      {/* NETFLIX-LEVEL CARD */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden group/card cursor-pointer transition-all duration-300 hover:scale-[1.08] hover:z-30"
        onClick={() => router.push(`/series/${show.id}`)}
      >
        {/* IMAGE - Use backdrop for movie poster look */}
        <Image
          src={
            show.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}` 
              : (show.poster_path
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : "/placeholder-series.jpg")
          }
          alt={show.name}
          fill
          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
          sizes="280px"
        />

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition duration-300" />

        {/* HOVER CONTENT (NETFLIX STYLE) */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition duration-300">
          
          {/* TITLE */}
          <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">
            {show.name}
          </h3>

          {/* META */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="text-green-400 font-semibold">
              {Math.round((show.vote_average || 0) * 10)}% Match
            </span>
            <span className="text-gray-300">
              {show.first_air_date
                ? new Date(show.first_air_date).getFullYear()
                : "N/A"}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {/* PLAY - Netflix style */}
            <button className="bg-white text-black px-4 py-1 rounded-md flex items-center gap-1 text-sm font-semibold hover:bg-gray-200 transition">
              <Play className="w-4 h-4" />
              Play
            </button>

            {/* ADD - Netflix style */}
            <button className="w-8 h-8 text-white rounded-full bg-black/70 border border-white/40 flex items-center justify-center hover:bg-white/20 transition">
              <span className="text-lg font-light">+</span>
            </button>

            
          </div>
        </div>

        {/* BADGE */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-bold">
          AI PICK
        </div>

        {/* RATING TOP RIGHT */}
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-white font-semibold">
            {show.vote_average?.toFixed(1)}
          </span>
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
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-600 hover:border-purple-600 z-10"
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
