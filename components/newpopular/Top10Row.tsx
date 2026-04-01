"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Plus, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Top10RowProps {
  media: (TMDBMovie | TMDBTVShow)[];
}

const Top10Row = ({ media }: Top10RowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-[#E50914]"; // Red for top 3
    if (rank <= 6) return "bg-[#3B82F6]"; // Blue for 4-6
    return "bg-[#9CA3AF]"; // Gray for 7-10
  };

  const getMatchPercentage = (media: TMDBMovie | TMDBTVShow, rank: number) => {
    // Enhanced match calculation based on rank and media properties
    const baseScore = media.vote_average * 10;
    const rankBonus = Math.max(0, (11 - rank) * 3); // Higher rank = higher bonus
    const popularityBoost = Math.min(media.popularity / 100, 15);
    const randomFactor = Math.random() * 8;
    return Math.min(Math.floor(baseScore + rankBonus + popularityBoost + randomFactor), 99);
  };

  const getBadges = (media: TMDBMovie | TMDBTVShow, rank: number) => {
    const badges: { type: string; color: string }[] = [];
    const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
    const daysSinceRelease = releaseDate ? Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (rank <= 3) badges.push({ type: 'TOP ' + rank, color: 'bg-red-600' });
    if (daysSinceRelease <= 14) badges.push({ type: 'NEW', color: 'bg-blue-500' });
    if (media.popularity > 800) badges.push({ type: 'TRENDING', color: 'bg-orange-500' });
    if (media.vote_average > 7.5) badges.push({ type: 'HOT', color: 'bg-pink-500' });
    
    return badges;
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="container mx-auto px-6 py-8">
        <h3 className="text-3xl font-bold text-[#F9FAFB] mb-6">Top 10 This Week</h3>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-6 pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.slice(0, 10).map((item, index) => {
            const title = 'title' in item ? item.title : item.name;
            const posterPath = item.poster_path;
            const rank = index + 1;
            const matchPercentage = getMatchPercentage(item, rank);
            const badges = getBadges(item, rank);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={`
                  relative w-64 h-96 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                  ${hoveredIndex === index ? 'scale-110 shadow-2xl shadow-red-500/40 shadow-blue-500/30' : 'scale-100 shadow-lg shadow-black/20'}
                `}>
                  {/* Rank Badge */}
                  <div className={`
                    absolute top-4 left-4 w-16 h-16 ${getRankBadgeColor(rank)} 
                    rounded-full flex items-center justify-center z-10
                    shadow-lg backdrop-blur-sm border-2 border-white/20
                  `}>
                    <span className="text-white font-bold text-2xl">{rank}</span>
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
                      {badges.map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className={`${badge.color} px-2 py-1 rounded text-white text-xs font-bold`}
                        >
                          {badge.type}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Poster */}
                  {posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#121826] to-[#1A2236]" />
                  )}

                  {/* Hover Overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                    transition-all duration-300
                    ${hoveredIndex === index ? 'opacity-100 scale-110 shadow-2xl shadow-red-500/40 shadow-blue-500/30' : 'opacity-0'}
                  `}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* Title and Year */}
                      <h4 className="text-white font-bold text-lg mb-1 line-clamp-1">{title}</h4>
                      <div className="flex items-center gap-2 mb-2 text-xs text-[#9CA3AF]">
                        {'release_date' in item ? item.release_date?.substring(0, 4) : item.first_air_date?.substring(0, 4)}
                        <span>•</span>
                        <span className="text-yellow-400">★ {item.vote_average.toFixed(1)}</span>
                      </div>
                      
                      {/* Description and Genres */}
                      {hoveredIndex === index && (
                        <div className="mb-3 space-y-2">
                          <p className="text-white/90 text-xs leading-relaxed line-clamp-3">
                            {item.overview?.substring(0, 120) || 'No description available...'}
                          </p>
                          
                          {/* Genre Tags */}
                          <div className="flex flex-wrap gap-1">
                            {['Action', 'Drama', 'Thriller', 'Comedy', 'Sci-Fi'].slice(0, Math.floor(Math.random() * 3) + 1).map((genre, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="icon-sm"
                          className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-medium rounded-lg"
                        >
                          <Play className="w-2 h-2 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white w-6 h-8 p-0 rounded-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {media.length > 4 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Top10Row;
