"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Plus, AlertTriangle, Skull, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { TMDBMovie } from "@/lib/types";

interface CreepyCarouselSimpleProps {
  className?: string;
}

const CreepyCarouselSimple = ({ className = "" }: CreepyCarouselSimpleProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = 240 * 2; // cardWidth * 2
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const creepyKeywords = [
    "blood","killer","death","haunted","demon",
    "ghost","psychological","slasher","murder",
    "horror","scary","evil","possessed",
    "curse","monster","vampire","zombie"
  ];

  useEffect(() => {
    const fetchCreepyMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.discover("movie", {
          genre: "27",
          minRating: 6.0,
          sortBy: "popularity.desc",
          page: 1,
        });

        const horrorMovies = (response.results as TMDBMovie[]) || [];

        const creepyMovies = horrorMovies.filter(movie => {
          const t = movie.title.toLowerCase();
          const o = movie.overview.toLowerCase();
          return creepyKeywords.some(k => t.includes(k) || o.includes(k));
        });

        setMovies(
          creepyMovies.length > 0
            ? creepyMovies.slice(0, 20)
            : horrorMovies.slice(0, 20)
        );
      } catch (err) {
        setError("Failed to load creepy content");
      } finally {
        setLoading(false);
      }
    };

    fetchCreepyMovies();
  }, []);

  const handlePlay = (id: number) => router.push(`/movie/${id}`);

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center gap-3">
          <Skull className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
        </div>

        {/* FULL BLEED RIGHT */}
        <div className="relative">
          <div className="relative ml-4 sm:ml-6 md:ml-12 lg:ml-20 mr-[-20px] sm:mr-[-24px] md:mr-[-48px] lg:mr-[-80px]">
            <div className="flex gap-3 overflow-x-auto py-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-[220px] flex-shrink-0">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className={`w-full ${className}`}>
      
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skull className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
          <span className="text-red-400 text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> 18+
          </span>
        </div>

        <span className="text-red-400 text-sm flex items-center gap-1">
          ● Live
        </span>
      </div>

      {/* FULL BLEED RIGHT CONTAINER */}
      <div className="relative">
        <div className="relative ml-4 sm:ml-6 md:ml-12 lg:ml-20 mr-[-20px] sm:mr-[-24px] md:mr-[-48px] lg:mr-[-80px]">

          {/* NAV BUTTONS */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center"
          >
            <ChevronRight />
          </button>

          {/* SCROLL */}
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scroll-smooth py-4"
          >
            {movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="w-[220px] flex-shrink-0 cursor-pointer"
                onClick={() => handlePlay(movie.id)}
              >
                {/* CARD */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* HOVER */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="icon"
                        className="bg-red-600 hover:bg-red-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(movie.id);
                        }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* BADGE */}
                  <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-2 text-xs text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> HORROR
                  </div>
                </div>

                {/* INFO */}
                <div className="mt-2">
                  <p className="text-white text-sm line-clamp-1">{movie.title}</p>
                  <p className="text-gray-400 text-xs">
                    {movie.release_date?.slice(0, 4)}
                  </p>
                </div>

                {/* BUTTON */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-gray-400 hover:text-white"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </motion.div>
            ))}

            <div className="flex-shrink-0 w-12 md:w-20" />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="text-red-500" />
          <div>
            <p className="text-red-400 text-sm font-medium">Content Warning</p>
            <p className="text-gray-400 text-xs">
              Contains violence and disturbing scenes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreepyCarouselSimple;