"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBTVShow, TMDBTVResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronRight, ChevronLeft, Star, Calendar, Tv, PlayCircle } from "lucide-react";
import Link from "next/link";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";

const BingeWorthySeriesCarousel = () => {
  const [bingeWorthy, setBingeWorthy] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBingeWorthy = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch TV shows with multiple criteria for binge-worthy content
        const pagePromises: Promise<TMDBTVResponse>[] = [];
        
        // Popular shows (likely to be binge-worthy)
        for (let page = 1; page <= 2; page++) {
          pagePromises.push(
            api.getMedia("tv", { 
              category: "popular", 
              page,
              sortBy: "popularity.desc"
            })
          );
        }
        
        // Top rated shows
        for (let page = 1; page <= 2; page++) {
          pagePromises.push(
            api.getMedia("tv", { 
              category: "top_rated", 
              page,
              sortBy: "vote_average.desc"
            })
          );
        }
        
        const responses = await Promise.all(pagePromises);
        const allShows: TMDBTVShow[] = [];
        
        responses.forEach(response => {
          allShows.push(...response.results);
        });
        
        // Remove duplicates based on show ID
        const uniqueShows = Array.from(
          new Map(allShows.map(show => [show.id, show])).values()
        );
        
        // Filter for binge-worthy shows: good ratings, decent popularity, multiple seasons
        const bingeWorthyShows = uniqueShows
          .filter(show => 
            show.vote_average >= 7.5 && // Good ratings
            show.popularity > 15 && // Decent popularity
            show.vote_count >= 100 // Enough votes
          )
          .sort((a, b) => (b.vote_average * b.popularity) - (a.vote_average * a.popularity)) // Sort by rating + popularity
          .slice(0, 20); // Take top 20
        
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

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Binge Worthy Series</h2>
            <p className="text-gray-400">Addictive shows that will keep you watching all night</p>
          </div>
          <Link 
            href="/tv?category=binge-worthy"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      

      {/* Full-Bleed Scroll Container */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="relative group">

          
      
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scroll Container */}
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-0"
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
              bingeWorthy.map((show) => (
                <div key={show.id} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                  <div className="relative group/movie-card">
                    <EnhancedMediaCard
                      media={show}
                      className="group/movie-card"
                    />
                    {/* Binge Worthy Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
                      🔥 Binge
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="flex-shrink-0 w-12 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingeWorthySeriesCarousel;
