"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface RecentlyAddedSeriesProps {
  title?: string;
}

export default function RecentlyAddedSeries({
  title = "Recently Added",
}: RecentlyAddedSeriesProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🔥 BETTER LOGIC (Recent + Quality)
  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      try {
        setLoading(true);

        const res = await api.discover("tv", {
          sortBy: "first_air_date.desc",
          page: 1,
        });

        const filtered = (res.results as TMDBTVShow[])
          .filter(
            (show) =>
              show.vote_average >= 6.5 && // avoid trash
              show.poster_path &&
              show.backdrop_path
          )
          .slice(0, 12);

        setSeries(filtered);
      } catch (err) {
        console.error(err);
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyAdded();
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="px-4 md:px-12 lg:px-20">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[220px] h-[130px] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!series.length) return null;

  return (
    <div className="relative">
      {/* HEADER (LEFT SAFE) */}
      <div className="px-4 md:px-12 lg:px-20 mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      {/* CAROUSEL */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory
            py-4
            pl-4 md:pl-12 lg:pl-20
            pr-0
            -mr-[50vw] w-[calc(100vw+50vw)]
          "
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-4 md:w-12 lg:w-20" />

          {series.map((show) => (
            <motion.div
              key={show.id}
              className="flex-shrink-0 snap-start"
              style={{ width: "220px" }} // 🔥 PERFECT SIZE
              onHoverStart={() => setHovered(show.id)}
              onHoverEnd={() => setHovered(null)}
            >
              <div
                className="relative rounded-lg overflow-hidden cursor-pointer group/card"
                onClick={() => router.push(`/series/${show.id}`)}
              >
                {/* IMAGE */}
                <div className="relative w-full h-[130px]">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${show.backdrop_path}`}
                    alt={show.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 220px"
                  />
                </div>

                {/* BADGE */}
                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] px-2 py-1 rounded font-bold">
                  NEW
                </div>

                {/* HOVER PANEL */}
                <AnimatePresence>
                  {hovered === show.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-black/90 p-3 flex flex-col justify-end"
                    >
                      {/* TITLE */}
                      <h3 className="text-white text-sm font-semibold line-clamp-2">
                        {show.name}
                      </h3>

                      {/* META */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{show.first_air_date?.slice(0, 4)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3" />
                          {show.vote_average?.toFixed(1)}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 mt-3">
                        <button className="flex-1 bg-white text-black text-xs py-1.5 rounded flex items-center justify-center gap-1 font-semibold">
                          <Play className="w-3 h-3" />
                          Play
                        </button>

                        <button className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}

          {/* RIGHT FULL BLEED SPACE */}
          <div className="flex-shrink-0 w-20 md:w-32 lg:w-40" />
        </div>

        {/* NAV BUTTONS */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="text-white w-5 h-5" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="text-white w-5 h-5" />
        </button>
      </div>
    </div>
  );
}