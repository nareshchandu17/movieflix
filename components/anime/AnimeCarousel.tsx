"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AnimeCarousel = () => {
  const [anime, setAnime] = useState<
    ((TMDBMovie & { media_type: "movie" }) | (TMDBTVShow & { media_type: "tv" }))[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleAnimeClick = (
    item: (TMDBMovie & { media_type: "movie" }) | (TMDBTVShow & { media_type: "tv" })
  ) => {
    const route = item.media_type === "movie" ? `/movie/${item.id}` : `/series/${item.id}`;
    router.push(route);
  };

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const [animeMoviesResponse, animeTVResponse] = await Promise.all([
          api.getMedia("movie", { category: "popular", genre: "16" }),
          api.getMedia("tv", { category: "popular", genre: "16" }),
        ]);

        const animeMovies = animeMoviesResponse.results.map((movie) => ({
          ...movie,
          media_type: "movie" as const,
        }));

        const animeTVShows = animeTVResponse.results.map((show) => ({
          ...show,
          media_type: "tv" as const,
        }));

        setAnime([...animeMovies, ...animeTVShows].slice(0, 100));
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
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
          <h2 className="text-3xl font-bold text-white">Anime</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 md:px-12 lg:px-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[160px] md:w-[200px] aspect-[2/3] bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!anime.length) return null;

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Anime</h2>
          </div>

          <Link
            href="/anime"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FULL BLEED CAROUSEL */}
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

        {/* SCROLL */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {anime.map((item, index) => (
            <motion.div
              key={`${item.media_type}-${item.id}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 snap-start cursor-pointer"
              style={{ width: `${cardWidth}px` }}
              onClick={() => handleAnimeClick(item)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/anime-card">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={"title" in item ? item.title : item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/anime-card:scale-110"
                />

                {/* Individual hover overlay with 1-second delay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/anime-card:opacity-100 transition-all duration-500 delay-150">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                      {"title" in item ? item.title : item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-white text-xs">{item.vote_average.toFixed(1)}</span>
                      </div>
                      {("release_date" in item && item.release_date) ||
                      ("first_air_date" in item && item.first_air_date) ? (
                        <span className="text-white/70 text-xs">
                          {new Date(
                            "release_date" in item
                              ? item.release_date!
                              : item.first_air_date!
                          ).getFullYear()}
                        </span>
                      ) : null}
                    </div>

                    {/* Buttons with 75% and 25% width */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-gray-800 flex-1 text-xs font-medium group-hover/anime-card:bg-gray-200 group-hover/anime-card:text-gray-800 transition-colors duration-300"
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
                        className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center group-hover/anime-card:border-white/50 group-hover/anime-card:bg-white/10 transition-colors duration-300"
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

          {/* END SPACER */}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default AnimeCarousel;