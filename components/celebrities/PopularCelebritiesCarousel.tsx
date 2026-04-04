"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CelebrityCard from "./CelebrityCard";
import { tmdbAPI } from "@/lib/api/tmdb";
import { TOP_20_ACTORS } from "@/lib/data/actorsData";
import { TOP_20_ACTRESSES } from "@/lib/data/actressesData";
import Link from "next/link";

interface Celebrity {
  name: string;
  profileURL: string;
  id: number;
  type: "actor" | "actress";
}

const PopularCelebritiesCarousel: React.FC = () => {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        setLoading(true);

        const [actorsData, actressesData] = await Promise.allSettled([
          tmdbAPI.getMultipleActors(TOP_20_ACTORS),
          tmdbAPI.getMultipleActors(TOP_20_ACTRESSES),
        ]);

        const actors =
          actorsData.status === "fulfilled"
            ? actorsData.value.map((a) => ({ ...a, type: "actor" as const }))
            : [];

        const actresses =
          actressesData.status === "fulfilled"
            ? actressesData.value.map((a) => ({ ...a, type: "actress" as const }))
            : [];

        const shuffled = [...actors, ...actresses].sort(() => Math.random() - 0.5);

        setCelebrities(shuffled.slice(0, 20));
      } catch (err) {
        setError("Failed to load celebrities");
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrities();
  }, []);

  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) setCardWidth(200);
      else if (width >= 640) setCardWidth(180);
      else setCardWidth(150); // slightly tighter on mobile
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = cardWidth * 2 + 8; // 🔥 reduced gap spacing

    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
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
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Popular Celebrities
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/actors"
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
            >
              <span className="text-sm font-medium">Actors</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/actresses"
              className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition"
            >
              <span className="text-sm font-medium">Actresses</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* FULL BLEED */}
      <div className="relative">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SCROLL */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-gray-800 animate-pulse" />
                    <div className="w-20 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                </div>
              ))
            : celebrities.map((celebrity) => (
                <div
                  key={`${celebrity.type}-${celebrity.id}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  {/* Individual hover only */}
                  <div className="hover:scale-105 transition-transform duration-300">
                    <CelebrityCard {...celebrity} size="medium" />
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

export default PopularCelebritiesCarousel;