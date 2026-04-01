"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Calendar, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NewReleasesCarouselProps {
  title?: string;
  subtitle?: string;
}

const newReleasesData = [
  // Add your hardcoded data here
  // Example:
  // {
  //   id: 1,
  //   title: "Movie Title",
  //   poster: "https://example.com/movie-poster.jpg",
  //   release_date: "2022-01-01",
  //   original_language: "en",
  //   vote_average: 8.5,
  // },
];

export default function NewReleasesCarousel({ title = "New Releases", subtitle = "Recently Added" }: NewReleasesCarouselProps) {
  const [movies, setMovies] = useState<NewRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set hardcoded data
  useEffect(() => {
    setLoading(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setMovies(newReleasesData);
      setLoading(false);
    }, 500);
  }, []);

  const nextSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(movies.length / 6)) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 280 + 16; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth * 6,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-green-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="text-sm text-green-400">{subtitle}</span>
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '280px' }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-green-500 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="text-sm text-green-400">{subtitle}</span>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
          onScroll={updateScrollButtons}
          style={{ scrollPaddingLeft: "3rem" }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '280px' }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => useRouter().push(`/movie/${movie.id}`)}>
                <Image
                  src={movie.poster || "https://i.imgur.com/wjVuAGb.png"}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="280px"
                  onError={(e) => {
                    // Fallback to a reliable placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.src = "https://i.imgur.com/wjVuAGb.png";
                  }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* New Badge */}
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  NEW
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-white text-xs font-semibold">
                      {movie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Movie Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  {movie.original_language && movie.original_language !== 'en' && (
                    <span className="ml-2 uppercase">• {movie.original_language}</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600 hover:border-green-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-600 hover:border-green-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
