"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBTVShow, TMDBTVResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Play, Info, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const BingeWorthySeriesCarousel = () => {
  const [bingeWorthy, setBingeWorthy] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(240);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Known broken image URLs - prevent them from being requested
  const brokenImageUrls = new Set([
    "https://image.tmdb.org/t/p/w500/49WJfev0moxR9p96p3YV4vDSYJu.jpg",
    "https://image.tmdb.org/t/p/w500/ggm1fb19179S9M9pS6v699yv69O.jpg"
  ]);

  // Get safe image URL with fallback
  const getSafeImageUrl = (show: TMDBTVShow) => {
    // Check if poster is in broken list
    if (show.poster_path && brokenImageUrls.has(`https://image.tmdb.org/t/p/w500${show.poster_path}`)) {
      // Try backdrop instead
      if (show.backdrop_path) {
        return `https://image.tmdb.org/t/p/w500${show.backdrop_path}`;
      }
      // Use gradient placeholder
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dc2626;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237c2d12;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23grad)' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(
        show.name || "Series"
      )}%3C/text%3E%3C/svg%3E`;
    }
    
    // Return poster if not broken
    if (show.poster_path) {
      return `https://image.tmdb.org/t/p/w500${show.poster_path}`;
    }
    
    // Fallback to backdrop
    if (show.backdrop_path) {
      return `https://image.tmdb.org/t/p/w500${show.backdrop_path}`;
    }
    
    // Final fallback to gradient
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dc2626;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237c2d12;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23grad)' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='24' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(
        show.name || "Series"
      )}%3C/text%3E%3C/svg%3E`;
  };

  useEffect(() => {
    const fetchBingeWorthy = async () => {
      try {
        setLoading(true);
        setError(null);

        const pagePromises: Promise<TMDBTVResponse>[] = [];

        for (let page = 1; page <= 2; page++) {
          pagePromises.push(
            api.getMedia("tv", {
              category: "popular",
              page,
              sortBy: "popularity.desc",
            })
          );
        }

        for (let page = 1; page <= 2; page++) {
          pagePromises.push(
            api.getMedia("tv", {
              category: "top_rated",
              page,
              sortBy: "vote_average.desc",
            })
          );
        }

        const responses = await Promise.all(pagePromises);

        const allShows: TMDBTVShow[] = [];
        responses.forEach((res) => allShows.push(...res.results));

        const uniqueShows = Array.from(
          new Map(allShows.map((show) => [show.id, show])).values()
        );

        const bingeWorthyShows = uniqueShows
          .filter(
            (show) =>
              show.vote_average >= 7.5 &&
              show.popularity > 15 &&
              show.vote_count >= 100
          )
          .sort(
            (a, b) =>
              b.vote_average * b.popularity -
              a.vote_average * a.popularity
          )
          .slice(0, 20);

        setBingeWorthy(bingeWorthyShows);
      } catch (err) {
        console.error("Error fetching binge-worthy series:", err);
        setError("Failed to load binge-worthy series");
      } finally {
        setLoading(false);
      }
    };

    fetchBingeWorthy();
  }, []);

  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 1536) setCardWidth(260); // 2xl
      else if (width >= 1280) setCardWidth(240); // xl
      else if (width >= 1024) setCardWidth(220); // lg
      else if (width >= 768) setCardWidth(200); // md
      else setCardWidth(180); // sm
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    return () => window.removeEventListener("resize", updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const scrollAmount = cardWidth * 3 + 24;

    carouselRef.current.scrollBy({
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Binge Worthy Series
            </h2>
            <p className="text-gray-400 text-sm">
              Series you won't be able to stop watching
            </p>
          </div>

          <Link
            href="/tv?category=binge-worthy"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-300 hover:scale-105"
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
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 hover:scale-110 border border-white/10 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* RIGHT BUTTON - Full Bleed Position */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 hover:scale-110 border border-white/10 shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* SCROLL CONTAINER - Full Bleed Right */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-6 pl-4 sm:pl-6 md:pl-12 lg:pl-20 pr-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingLeft: "5rem",
          }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 snap-start"
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="w-full h-[360px] bg-gray-800 rounded-xl animate-pulse" />
                </div>
              ))
            : bingeWorthy.map((show) => (
                <div
                  key={show.id}
                  className="flex-shrink-0 snap-start cursor-pointer"
                  style={{ width: `${cardWidth}px` }}
                >
                  {/* Netflix-Level Premium Card */}
                  <motion.div
                    className="relative group"
                    onHoverStart={() => setHoveredCard(show.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Card Image */}
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800">
                      <img
                        src={getSafeImageUrl(show)}
                        alt={show.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Binge Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg backdrop-blur-sm border border-red-500/30">
                        🔥 BINGE
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-yellow-400 rounded-lg border border-yellow-400/30">
                        ⭐ {show.vote_average.toFixed(1)}
                      </div>

                      {/* Hover Overlay */}
                      <AnimatePresence>
                        {hoveredCard === show.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
                          >
                            {/* Title */}
                            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                              {show.name}
                            </h3>

                            {/* Info */}
                            <div className="flex items-center gap-2 text-gray-300 text-xs mb-3">
                              <span>{show.first_air_date?.split('-')[0]}</span>
                              <span>•</span>
                              <span>{show.vote_count} votes</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-medium transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                Play
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-xs font-medium transition-colors backdrop-blur-sm"
                              >
                                <Info className="w-3 h-3" />
                                Info
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors backdrop-blur-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subtle Border Glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                </div>
              ))}

          {/* END SPACER - Full Bleed Right */}
          <div className="flex-shrink-0 w-20 md:w-32 lg:w-40" />
        </div>
      </div>
    </div>
  );
};

export default BingeWorthySeriesCarousel;