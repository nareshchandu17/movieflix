"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";
import { useRouter } from "next/navigation";

interface HollywoodMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_count: number;
  media_type: "movie";
}

const PopularHollywoodCarousel = () => {
  const [movies, setMovies] = useState<HollywoodMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises: Promise<TMDBMovieResponse>[] = [];
        for (let i = 1; i <= 4; i++) {
          promises.push(
            api.getMedia("movie", {
              category: "popular",
              page: i,
              sortBy: "popularity.desc",
            })
          );
        }

        const responses = await Promise.all(promises);

        const all: HollywoodMovie[] = [];
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
        );

        const shuffled = unique.sort(() => Math.random() - 0.5);

        setMovies(shuffled.slice(0, 20));
      } catch (err) {
        setError("Failed to load Hollywood movies");
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

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;

    const amount = cardWidth * 2 + 8;

    carouselRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* HEADER (NO ICON) */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Popular in Hollywood
            </h2>
          </div>

          <Link
            href="/hollywood"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
          >
            <span className="text-sm font-medium">Browse All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED */}
      <div className="relative">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
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
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : movies.map((movie, i) => (
                <div
                  key={`${movie.id}-${i}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  {/* INDIVIDUAL HOVER */}
                  <div className="relative hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <EnhancedMediaCard media={movie} />
                  </div>
                </div>
              ))}

          {/* END SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default PopularHollywoodCarousel;