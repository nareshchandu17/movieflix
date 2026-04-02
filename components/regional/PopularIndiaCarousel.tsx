"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { teluguApi, TeluguMovie } from "@/lib/teluguApi";
import { hindiApi, HindiMovie } from "@/lib/hindiApi";
import { api } from "@/lib/api";
import { TMDBMovie } from "@/lib/types";
import { ChevronRight, ChevronLeft, Star, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all Indian content concurrently
      const [teluguMovies, hindiMovies, englishMovies] = await Promise.allSettled([
        teluguApi.fetchTeluguMovies(400),
        hindiApi.fetchHindiMovies(100),
        api.getMedia("movie", { 
          category: "popular", 
          page: 1,
          sortBy: "popularity.desc"
        })
      ]);

      const allIndianMovies: IndianMovie[] = [];

      // Process Telugu movies
      if (teluguMovies.status === "fulfilled") {
        const teluguWithRegion = teluguMovies.value.map(movie => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          overview: movie.overview,
          media_type: 'movie' as const,
          region: 'telugu' as const
        }));
        allIndianMovies.push(...teluguWithRegion);
      }

      // Process Hindi movies
      if (hindiMovies.status === "fulfilled") {
        const hindiWithRegion = hindiMovies.value.map(movie => ({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          overview: movie.overview,
          media_type: 'movie' as const,
          region: 'hindi' as const
        }));
        allIndianMovies.push(...hindiWithRegion);
      }

      // Process English movies (Indian English content)
      if (englishMovies.status === "fulfilled") {
        const englishWithRegion = englishMovies.value.results.slice(0, 200).map(movie => ({
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
          rating: movie.vote_average,
          posterUrl: movie.poster_path,
          backdropUrl: movie.backdrop_path,
          overview: movie.overview,
          media_type: 'movie' as const,
          region: 'english' as const
        }));
        allIndianMovies.push(...englishWithRegion);
      }

      // Shuffle for mixed display and take top 20
      const shuffled = allIndianMovies.sort(() => Math.random() - 0.5);
      setIndianMovies(shuffled.slice(0, 20));
      
    } catch (err) {
      console.error("Error fetching Indian movies:", err);
      setError("Failed to load Indian movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Update card width based on window size
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) {
        setCardWidth(200);
      } else if (width >= 640) {
        setCardWidth(180);
      } else {
        setCardWidth(160);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    
    const scrollAmount = cardWidth * 2 + 12;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
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

  const getRegionBadge = (region: string) => {
    const badges = {
      telugu: { text: "Telugu", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
      hindi: { text: "Hindi", color: "bg-green-500/20 text-green-300 border-green-500/30" },
      english: { text: "English", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" }
    };
    return badges[region as keyof typeof badges] || badges.english;
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 via-green-500/20 to-blue-500/20 border border-orange-500/30">
              <Globe className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Popular in India</h2>
              <p className="text-gray-400">Discover Telugu, Hindi & English movies from Indian cinema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/telugu"
              className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">Telugu</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/hindi"
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">Hindi</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/english"
              className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors duration-300 group"
            >
              <span className="text-sm font-medium">English</span>
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Full-Bleed Scroll Container */}
      <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
        <div className="relative group">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-orange-500/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-orange-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-orange-500/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scroll Container */}
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Skeleton Loaders
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="w-full h-64 bg-gray-800 rounded-xl animate-pulse border border-gray-700/50" />
                </div>
              ))
            ) : (
              indianMovies.map((movie) => {
                const regionBadge = getRegionBadge(movie.region);
                return (
                  <div key={`${movie.region}-${movie.id}`} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                    <div className="relative group/movie-card">
                      <EnhancedMediaCard
                        media={{
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
                        }}
                        className="group/movie-card"
                      />
                      {/* Region Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${regionBadge.color} backdrop-blur-sm`}>
                        {regionBadge.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularIndiaCarousel;
