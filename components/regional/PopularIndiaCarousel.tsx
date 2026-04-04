"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { teluguApi } from "@/lib/teluguApi";
import { hindiApi } from "@/lib/hindiApi";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";
import { useRouter } from "next/navigation";

interface IndianMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  media_type: 'movie';
  region: 'telugu' | 'hindi' | 'english';
}

const PopularIndiaCarousel = () => {
  const [indianMovies, setIndianMovies] = useState<IndianMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [teluguMovies, hindiMovies, englishMovies] = await Promise.allSettled([
        teluguApi.fetchTeluguMovies(400),
        hindiApi.fetchHindiMovies(100),
        api.getMedia("movie", { category: "popular", page: 1, sortBy: "popularity.desc" })
      ]);

      const allIndianMovies: IndianMovie[] = [];

      if (teluguMovies.status === "fulfilled") {
        allIndianMovies.push(
          ...teluguMovies.value.map(movie => ({
            ...movie,
            media_type: 'movie' as const,
            region: 'telugu' as const
          }))
        );
      }
      if (hindiMovies.status === "fulfilled") {
        allIndianMovies.push(
          ...hindiMovies.value.map(movie => ({
            ...movie,
            media_type: 'movie' as const,
            region: 'hindi' as const
          }))
        );
      }
      if (englishMovies.status === "fulfilled") {
        allIndianMovies.push(
          ...englishMovies.value.results.slice(0, 200).map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
            rating: movie.vote_average,
            posterUrl: movie.poster_path,
            backdropUrl: movie.backdrop_path,
            overview: movie.overview,
            media_type: 'movie' as const,
            region: 'english' as const
          }))
        );
      }

      setIndianMovies(allIndianMovies.sort(() => Math.random() - 0.5).slice(0, 20));
    } catch (err) {
      console.error(err);
      setError("Failed to load Indian movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  useEffect(() => {
    const updateCardWidth = () => {
      const w = window.innerWidth;
      if (w >= 768) setCardWidth(200);
      else if (w >= 640) setCardWidth(180);
      else setCardWidth(160);
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    
    const amt = cardWidth * 2 + 12; // match ActionSection spacing
    const container = carouselRef.current;
    
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

  const getRegionBadge = (region: string) => {
    const styles = {
      telugu: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      hindi: "bg-green-500/20 text-green-300 border-green-500/30",
      english: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    };
    return styles[region as keyof typeof styles];
  };

  if (error) return (
    <div className="px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Popular in India</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/telugu" className="text-orange-500 hover:text-orange-400 flex items-center gap-1">
            Telugu <ChevronRight className="w-4 h-4 hover:translate-x-1 transition" />
          </Link>
          <Link href="/hindi" className="text-green-500 hover:text-green-400 flex items-center gap-1">
            Hindi <ChevronRight className="w-4 h-4 hover:translate-x-1 transition" />
          </Link>
          <Link href="/english" className="text-blue-500 hover:text-blue-400 flex items-center gap-1">
            English <ChevronRight className="w-4 h-4 hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>

      {/* CAROUSEL FULL-BLEED RIGHT */}
      <div className="relative -mr-4 sm:-mr-6 md:-mr-12 lg:-mr-20">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600/80 transition z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600/80 transition z-20"
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
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : indianMovies.map(movie => (
                <div key={`${movie.region}-${movie.id}`} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="relative">
                    <EnhancedMediaCard media={{
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.posterUrl,
                      backdrop_path: movie.backdropUrl,
                      overview: movie.overview,
                      vote_average: movie.rating,
                      release_date: movie.year.toString(),
                      adult: false,
                      genre_ids: [],
                      original_language: "en",
                      original_title: movie.title,
                      popularity: 0,
                      video: false,
                      vote_count: 0
                    }} />
                    {/* Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full border backdrop-blur-sm ${getRegionBadge(movie.region)}`}>
                      {movie.region}
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

export default PopularIndiaCarousel;