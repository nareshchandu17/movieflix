"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Gem } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";

const HiddenGemsCarousel = () => {
  const [hiddenGems, setHiddenGems] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch Hidden Gems
  useEffect(() => {
    const fetchHiddenGems = async () => {
      try {
        setLoading(true);
        setError(null);

        const pagePromises: Promise<TMDBMovieResponse>[] = [];
        for (let page = 1; page <= 3; page++) {
          pagePromises.push(
            api.getMedia("movie", {
              category: "top_rated",
              page,
              sortBy: "vote_average.desc",
            })
          );
        }

        const responses = await Promise.all(pagePromises);
        const allMovies: TMDBMovie[] = [];
        responses.forEach(response => allMovies.push(...response.results));

        const uniqueMovies = allMovies.filter(
          (movie, index, self) => index === self.findIndex(m => m.id === movie.id)
        );

        let hidden = uniqueMovies
          .filter(
            movie =>
              movie.vote_average >= 5 &&
              movie.popularity < 100 &&
              movie.vote_count >= 10 &&
              movie.poster_path &&
              movie.overview
          )
          .sort((a, b) => b.vote_average - a.vote_average)
          .slice(0, 20);

        if (hidden.length === 0) {
          hidden = uniqueMovies
            .filter(movie => movie.poster_path && movie.overview)
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 20);
        }

        setHiddenGems(hidden);
      } catch (err) {
        console.error("Error fetching hidden gems:", err);
        setError("Failed to load hidden gems");
      } finally {
        setLoading(false);
      }
    };

    fetchHiddenGems();
  }, []);

  // Responsive card width
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) setCardWidth(200);
      else if (width >= 640) setCardWidth(180);
      else setCardWidth(160);
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  // Scroll handler
  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = cardWidth * 2 + 12;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Gem className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Hidden Gems</h2>
          </div>
        </div>

        <Link
          href="/hidden-gems"
          className="flex items-center gap-2 text-purple-500 hover:text-purple-400 transition-colors duration-300 group"
        >
          <span className="text-sm font-medium">Discover More</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* CAROUSEL FULL-BLEED RIGHT */}
      <div className="relative -mr-4 sm:-mr-6 md:-mr-12 lg:-mr-20">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-purple-600/80 transition z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SCROLL CONTAINER */}
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4"
        >
          {/* LEFT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />

          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse border border-gray-700/50" />
                </div>
              ))
            : hiddenGems.map((movie, index) => (
                <div
                  key={`${movie.id}-${index}`}
                  className="snap-start flex-shrink-0"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="relative group/movie-card">
                    <EnhancedMediaCard media={movie} className="group/movie-card" />
                    {/* Hidden Gem Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm">
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}

          {/* RIGHT SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default HiddenGemsCarousel;