"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface NewEpisodesThisWeekProps {
  title?: string;
}

export default function NewEpisodesThisWeek({
  title = "New Episodes This Week",
}: NewEpisodesThisWeekProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch ongoing shows with recent episodes
  useEffect(() => {
    const fetchNewEpisodes = async () => {
      try {
        setLoading(true);

        // Get date range for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();

        // Format dates as YYYY-MM-DD for TMDB API
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Get shows with recent air dates using proper API filtering
        const responses = await Promise.all([
          api.getTrending("tv", "week", 1),
          api.discover('tv', { 
            sortBy: 'first_air_date.desc', 
            page: 1,
            airDateGte: formatDate(thirtyDaysAgo),
            airDateLte: formatDate(today)
          }),
          api.getPopular("tv", 1)
        ]);

        // Combine results and limit to 8 shows
        const allSeries = [
          ...(responses[0].results as TMDBTVShow[] || []),
          ...(responses[1].results as TMDBTVShow[] || []),
          ...(responses[2].results as TMDBTVShow[] || [])
        ];

        // Remove duplicates and limit to 8
        const uniqueSeries = allSeries.filter((show, index, self) => 
          index === self.findIndex((s) => s.id === show.id)
        ).slice(0, 8);

        setSeries(uniqueSeries);
      } catch (error) {
        console.error('Failed to fetch new episodes:', error);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewEpisodes();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  const getDayLabel = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  if (loading) {
    return (
      <div className="relative">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="flex gap-4 overflow-x-auto px-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[300px] h-[180px] bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!series.length) return null;

  return (
    <div className="relative">
      {/* HEADER (LEFT SAFE) */}
      <div className="px-6 md:px-12 lg:px-20 mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* 🔥 FULL BLEED RIGHT ONLY */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4
            pl-6 md:pl-12 lg:pl-20
            pr-0
            -mr-[50vw] w-[calc(100vw+50vw)]
          "
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />

          {series.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 snap-start"
              style={{ width: "300px" }}
            >
              {/* 🎬 NEW EPISODE CARD */}
              <div
                onClick={() => router.push(`/series/${show.id}`)}
                className="relative rounded-xl overflow-hidden group/card cursor-pointer transition-all duration-300 hover:scale-[1.08] hover:z-30"
              >
                <Image
                  src={
                    show.backdrop_path
                      ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}`
                      : "/placeholder-series.jpg"
                  }
                  alt={show.name}
                  width={300}
                  height={180}
                  className="object-cover w-full h-[170px]"
                />

                {/* GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* MOVIE NAME - ALWAYS VISIBLE */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
                    {show.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-green-400 font-semibold">
                      {Math.round((show.vote_average || 0) * 10)}% Match
                    </span>
                    <span>
                      {show.first_air_date?.split("-")[0]}
                    </span>
                  </div>
                </div>

                {/* TOP BADGES */}
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  NEW EP
                </div>

                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-green-400">
                  {show.first_air_date && getDayLabel(show.first_air_date)}
                </div>

                {/* HOVER CONTENT - ENHANCED ACTIONS */}
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                        <Play className="w-4 h-4 ml-[1px]" />
                      </button>

                      <button className="w-8 h-8 rounded-full bg-black/70 border border-white/40 text-white hover:bg-white/20 transition-colors">
                        +
                      </button>

                      <button className="ml-auto text-xs text-gray-300 flex items-center gap-1 hover:text-white transition-colors">
                        <Calendar className="w-3 h-3" />
                        This Week
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* RIGHT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>

        {/* ARROWS */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-green-600 z-10"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition hover:bg-green-600 z-10"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}