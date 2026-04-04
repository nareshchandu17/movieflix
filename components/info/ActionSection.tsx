"use client";

import React, { useRef, useEffect, useState } from "react";
import { IAction } from "@/lib/models/Action";
import { TMDBMovie } from "@/lib/types";
import { ChevronRight, ChevronLeft, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ActionSection = () => {
  const [data, setData] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClick = (id: number) => router.push(`/movie/${id}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/action?limit=66");
        const result = await res.json();

        const transformed: TMDBMovie[] = (result.results || []).map(
          (item: IAction) => ({
            id: item.id || 0,
            title: item.title || item.name || "",
            overview: item.overview || "",
            poster_path: item.poster_path || null,
            backdrop_path: item.backdrop_path || null,
            release_date: item.release_date || "",
            vote_average: item.vote_average || 0,
            vote_count: 0,
            genre_ids: [],
            adult: false,
            original_language: "en",
            original_title: item.title || "",
            popularity: 0,
            video: false,
          })
        );

        setData(transformed);
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
      else setCardWidth(160);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    
    const amt = cardWidth * 2 + 8;
    const container = scrollRef.current;
    
    // Custom smooth scrolling with momentum for buttery feel
    const startTime = performance.now();
    const startX = container.scrollLeft;
    const targetX = startX + (dir === "left" ? -amt : amt);
    const duration = 400; // Slightly longer for smoother feel
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth acceleration and deceleration
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentX = startX + (targetX - startX) * easeInOutCubic;
      container.scrollLeft = currentX;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular in Action</h2>
          </div>

          <Link
            href="/action-movies"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
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
          ref={scrollRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollPaddingLeft: "5rem" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                </div>
              ))
            : data.slice(0, 20).map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className="flex-shrink-0 snap-start cursor-pointer"
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => handleClick(movie.id)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/card">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/card:scale-110"
                    />

                    {/* INDIVIDUAL HOVER */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition duration-500">
                      <div className="absolute bottom-0 p-4">
                        <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2">
                          {movie.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-white text-black text-xs">
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

          {/* END SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default ActionSection;