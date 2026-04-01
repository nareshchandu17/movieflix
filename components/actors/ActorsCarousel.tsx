"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ActorCard from "./ActorCard";
import { tmdbAPI } from "@/lib/api/tmdb";
import { TOP_20_ACTORS } from "@/lib/data/actorsData";
import Link from "next/link";

interface Actor {
  name: string;
  profileURL: string;
  id: number;
}

const ActorsCarousel: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardWidth, setCardWidth] = useState(200);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true);
        const actorsData = await tmdbAPI.getMultipleActors(TOP_20_ACTORS);
        setActors(actorsData);
      } catch (err) {
        setError("Failed to load actors");
        console.error("Error fetching actors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
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
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = cardWidth * 2 + 12; // Card width * 2 + gap (gap-3 = 12px)
    scrollContainerRef.current.scrollBy({
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Top 20 Great Actors</h2>
          <p className="text-gray-400">Discover legendary performances from cinema's finest</p>
        </div>
        
        <Link 
          href="/actors"
          className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
        >
          <span className="text-sm font-medium">Browse Collection</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Full-Bleed Scroll Container */}
      <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
        <div className="relative group">
          {/* Navigation Buttons - Always Visible (No hover opacity) */}
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
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Skeleton Loaders
              Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 animate-pulse border border-gray-700/50" />
                    <div className="w-full h-4 bg-gray-800 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : (
              actors.map((actor) => (
                <div key={actor.id} className="snap-start flex-shrink-0" style={{ width: `${cardWidth}px` }}>
                  <ActorCard
                    name={actor.name}
                    profileURL={actor.profileURL}
                    id={actor.id}
                    size="medium"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorsCarousel;
