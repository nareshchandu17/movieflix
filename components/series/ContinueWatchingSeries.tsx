"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBTVShow } from "@/lib/types";

interface ContinueWatchingSeriesProps {
  title?: string;
}

export default function ContinueWatchingSeries({
  title = "Continue Watching",
}: ContinueWatchingSeriesProps) {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setSeries([
      {
        id: 1,
        name: "Breaking Bad",
        backdrop_path: "https://media.themoviedb.org/t/p/w260_and_h390_face/r3z70vunihrAkjILQKWHX0G2xzO.jpg",
        first_air_date: "2008-01-20",
        vote_average: 9.5,
      } as TMDBTVShow,
      {
        id: 2,
        name: "Stranger Things",
        backdrop_path: "https://media.themoviedb.org/t/p/w260_and_h390_face/5i5Fg549J27knMvhI5NRM2FT3Gn.jpg",
        first_air_date: "2016-07-15",
        vote_average: 8.7,
      } as TMDBTVShow,
    ]);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -500 : 500,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* HEADER (UNCHANGED) */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative group">
        {/* ✅ FIXED SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          className="
            flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory
            py-6
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {series.map((show) => {
            const isHovered = hovered === show.id;

            return (
              <motion.div
                key={show.id}
                className="relative flex-shrink-0"
                style={{ width: isHovered ? 420 : 360 }}
                onHoverStart={() => setHovered(show.id)}
                onHoverEnd={() => setHovered(null)}
                animate={{ width: isHovered ? 420 : 360 }}
                transition={{ duration: 0.3 }}
              >
                {/* CARD */}
                <motion.div
                  className="relative rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/series/${show.id}`)}
                  whileHover={{ scale: 1.04 }}
                >
                  {/* IMAGE */}
                  <div className="relative h-[200px] w-full bg-gray-800">
                    <img
                      src={show.backdrop_path || ''}
                      alt={show.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-800 text-white text-lg font-semibold">${show.name}</div>`;
                        }
                      }}
                    />
                  </div>

                  {/* GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* PROGRESS */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-700">
                    <div className="h-full bg-blue-500 w-[70%]" />
                  </div>

                  {/* CONTENT */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg">
                      {show.name}
                    </h3>

                    <p className="text-gray-300 text-sm mt-1">
                      Episode 4 • 32m remaining
                    </p>

                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mt-4"
                      >
                        <button className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
                          <Play className="w-4 h-4" />
                          Resume
                        </button>

                        <button className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
                          <Plus className="text-white w-5 h-5" />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* ✅ KEEP RIGHT FULL BLEED */}
          <div className="flex-shrink-0 w-20 md:w-32 lg:w-40" />
        </div>

        {/* NAV BUTTONS (UNCHANGED) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="text-white w-5 h-5" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="text-white w-5 h-5" />
        </button>
      </div>
    </div>
  );
}