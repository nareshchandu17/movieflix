"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBMovieResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HorrorCarousel = () => {
  const [horrorMovies, setHorrorMovies] = useState<(TMDBMovie & { media_type: 'movie' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  useEffect(() => {
    const fetchHorrorMovies = async () => {
      try {
        const pagePromises: Promise<TMDBMovieResponse>[] = [];

        for (let page = 1; page <= 5; page++) {
          pagePromises.push(
            api.getMedia("movie", {
              category: "popular",
              genre: "27",
              page,
              sortBy: "popularity.desc",
            })
          );
        }

        const responses = await Promise.all(pagePromises);

        const allMovies = responses.flatMap((res) =>
          res.results.map((movie) => ({
            ...movie,
            media_type: "movie" as const,
          }))
        );

        const uniqueMovies = allMovies
          .filter((movie, index, self) => index === self.findIndex((m) => m.id === movie.id))
          .slice(0, 250);

        setHorrorMovies(uniqueMovies);
      } catch (error) {
        console.error("Error fetching horror movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorrorMovies();
  }, []);

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

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = cardWidth * 2 + 16;

    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6">
          <h2 className="text-3xl font-bold text-white">Horror Movies</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 md:px-12 lg:px-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[160px] md:w-[200px] aspect-[2/3] bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!horrorMovies.length) return null;

  return (
    <div className="w-full">
      {/* HEADER (aligned) */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Horror Movies</h2>
          </div>

          <Link
            href="/movie?genre=horror"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED SECTION */}
      <div className="relative group">
        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SCROLL CONTAINER */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {horrorMovies.map((movie, index) => (
            <motion.div
              key={`${movie.id}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 snap-start cursor-pointer"
              style={{ width: `${cardWidth}px` }}
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/movie-card">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/movie-card:scale-110"
                />
                
                {/* Individual hover overlay with 1-second delay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/movie-card:opacity-100 transition-all duration-500 delay-150">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{movie.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                      </div>
                      {movie.release_date && (
                        <span className="text-white/70 text-xs">
                          {new Date(movie.release_date).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    {/* Buttons with 75% and 25% width */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-white text-black hover:bg-gray-800 flex-1 text-xs font-medium group-hover/movie-card:bg-gray-200 group-hover/movie-card:text-gray-800 transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle play action
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center group-hover/movie-card:border-white/50 group-hover/movie-card:bg-white/10 transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle add to watchlist
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* END SPACER (IMPORTANT for OTT feel) */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default HorrorCarousel;