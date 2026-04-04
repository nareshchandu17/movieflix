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

const CrimeMysteryCarousel = () => {
  const [movies, setMovies] = useState<(TMDBMovie & { media_type: "movie" })[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClick = (id: number) => router.push(`/movie/${id}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          api.getMedia("movie", { category: "popular", genre: "80" }),
          api.getMedia("movie", { category: "popular", genre: "9643" }),
          api.getTrending("movie", "week"),
        ]);

        const all: (TMDBMovie & { media_type: "movie" })[] = [];

        responses.forEach((res, i) => {
          let list: TMDBMovie[] = [];
          if (i === 2) {
            list = res.results.filter((m) => m.genre_ids?.includes(80) || m.genre_ids?.includes(9643)) as TMDBMovie[];
          } else list = res.results as TMDBMovie[];

          all.push(...list.map((m) => ({ ...m, media_type: "movie" as const })));
        });

        const unique = all.filter((m, i, self) => i === self.findIndex((x) => x.id === m.id)).slice(0, 120);
        setMovies(unique);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Crime & Mystery</h2>
          </div>
          <Link
            href="/movie?genre=crime-mystery"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED CAROUSEL */}
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
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollPaddingLeft: "5rem" }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : movies.map((movie, i) => (
                <div
                  key={`${movie.id}-${i}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => handleClick(movie.id)}
                >
                  <motion.div className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* HOVER */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="absolute bottom-0 p-4 w-full">
                        <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">{movie.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 text-xs bg-white text-black hover:bg-gray-200" onClick={(e) => e.stopPropagation()}>
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline" className="w-8 h-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
          {/* END SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default CrimeMysteryCarousel;