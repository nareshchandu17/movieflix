"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSmoothScroll } from "@/lib/utils/smoothScroll";

const DramaCarousel = () => {
  const [movies, setMovies] = useState<(TMDBMovie & { media_type: "movie" })[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const promises = [
          api.getMedia("movie", { category: "popular", genre: "18" }),
          api.getMedia("movie", { category: "top_rated", genre: "18" }),
          api.getMedia("movie", { category: "now_playing", genre: "18" }),
          api.getMedia("movie", { category: "upcoming", genre: "18" }),
        ];

        const responses = await Promise.all(promises);

        const all: (TMDBMovie & { media_type: "movie" })[] = [];

        responses.forEach((res) => {
          all.push(
            ...res.results.map((m) => ({
              ...m,
              media_type: "movie" as const,
            }))
          );
        });

        const unique = Array.from(
          new Map(all.map((m) => [m.id, m])).values()
        )
          .map((m) => ({
            ...m,
            score: (m.popularity || 0) + (m.vote_average || 0) * 100,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 200);

        setMovies(unique);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 768) setCardWidth(200);
      else if (w >= 640) setCardWidth(180);
      else setCardWidth(150);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = useSmoothScroll(carouselRef, cardWidth, 8);

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Drama</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[180px] h-[260px] bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Drama</h2>
          </div>

          <Link
            href="/movie?genre=drama"
            className="flex items-center gap-2 text-red-500 hover:text-red-400"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED */}
      <div className="relative">
        {/* LEFT */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SCROLL */}
        <div
          ref={carouselRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {movies.map((movie, i) => (
            <motion.div
              key={`${movie.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 snap-start cursor-pointer"
              style={{ width: `${cardWidth}px` }}
              onClick={() => router.push(`/movie/${movie.id}`)}
            >
              {/* INDIVIDUAL HOVER */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition">
                  <div className="absolute bottom-0 p-3">
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {movie.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-white text-black text-xs">
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>

                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* END SPACE */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default DramaCarousel;