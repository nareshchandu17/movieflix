"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { teluguApi, TeluguMovie } from "@/lib/teluguApi";
import { ChevronRight, ChevronLeft, Star, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";

const TeluguCarousel = () => {
  const [teluguMovies, setTeluguMovies] = useState<TeluguMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const movies = await teluguApi.fetchTeluguMovies(1000);
      setTeluguMovies(movies);
    } catch (err) {
      console.error("Error fetching Telugu movies:", err);
      setError("Failed to load Telugu movies");
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
    if (carouselRef.current) {
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap

      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Telugu Collection</h2>
            <p className="text-gray-400">Premium Telugu cinema experience</p>
          </div>
          <Link 
            href="/telugu"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Scroll Container with Left Padding */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
          <div className="relative group">
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Show top 20 most popular movies in carousel
  const carouselMovies = teluguMovies.slice(0, 20);

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Telugu Collection</h2>
            <p className="text-gray-400">{teluguMovies.length}+ Premium Telugu movies</p>
          </div>
          <Link 
            href="/telugu"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Scroll Container with Left Padding */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
          <div className="relative group">
            {/* Navigation Buttons */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {carouselMovies.map((movie, index) => {
                // Convert TeluguMovie to TMDBMovie format for MediaCard
                const mediaItem = {
                  id: movie.id,
                  title: movie.title,
                  poster_path: movie.posterUrl?.replace('https://image.tmdb.org/t/p/w1280', ''),
                  backdrop_path: movie.backdropUrl?.replace('https://image.tmdb.org/t/p/w1280', ''),
                  vote_average: movie.rating,
                  vote_count: 100,
                  overview: movie.overview,
                  release_date: movie.year.toString(),
                  adult: false,
                  original_language: 'te',
                  original_title: movie.title,
                  popularity: 10,
                  video: false,
                  genre_ids: [],
                  media_type: 'movie' as const
                };

                return (
                  <div
                    key={movie.id}
                    className="flex-shrink-0 snap-start"
                    style={{ width: `${cardWidth}px` }}
                  >
                    <EnhancedMediaCard
                      media={mediaItem}
                      variant="horizontal"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeluguCarousel;
