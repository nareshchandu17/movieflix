"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, Info } from "lucide-react";
import CollectionPopup from "../collections/CollectionPopup";
import { AnimatePresence } from "framer-motion";

interface EnhancedNewReleasesGridProps {
  media: (TMDBMovie | TMDBTVShow)[];
  title?: string;
  showViewAll?: boolean;
}

const EnhancedNewReleasesGrid = ({ 
  media, 
  title,
  showViewAll = true 
}: EnhancedNewReleasesGridProps) => {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(10);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Collection Popup state
  const [popupMedia, setPopupMedia] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | undefined>(undefined);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, media.length));
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 500;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!media || media.length === 0) return null;

  // Enhanced badge system with consistent hierarchy
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'NEW': return 'bg-blue-500';
      case 'TRENDING': return 'bg-red-500';
      case 'TOP RATED': return 'bg-purple-500';
      case 'EXCLUSIVE': return 'bg-yellow-500';
      case 'MUST WATCH': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const generateBadges = (item: TMDBMovie | TMDBTVShow) => {
    const badges: string[] = [];
    const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
    const daysSinceRelease = releaseDate ? Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (daysSinceRelease <= 30) badges.push('NEW');
    if (item.popularity > 1000) badges.push('TRENDING');
    if (item.vote_average > 8) badges.push('TOP RATED');
    if (Math.random() > 0.85) badges.push('EXCLUSIVE');
    if (Math.random() > 0.9) badges.push('MUST WATCH');
    
    return badges.slice(0, 2); // Limit to 2 badges for cleaner look
  };

  const getGenreName = (genreIds: number[]) => {
    const genreMap: { [key: number]: string } = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
      10752: 'War', 37: 'Western'
    };
    return genreIds?.map(id => genreMap[id]).filter(Boolean).slice(0, 2) || [];
  };

  const getRuntime = (item: TMDBMovie | TMDBTVShow) => {
    if ('runtime' in item && item.runtime && typeof item.runtime === 'number') {
      return `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`;
    }
    // For TV shows, simulate runtime
    const minutes = Math.floor(Math.random() * 60) + 30;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="relative">
      {/* Section Header with View All */}
      <div className="flex items-center justify-between mb-6">
        {title && (
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-teal-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
        )}
        {showViewAll && (
          <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 group">
            <span className="text-sm font-medium">View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        )}
      </div>

      {/* Enhanced Carousel Container */}
      <div className="relative group">
        {/* Edge Fade Effects */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.slice(0, visibleCount).map((item, index) => {
            const title = 'title' in item ? item.title : item.name;
            const posterPath = item.poster_path;
            const year = 'release_date' in item ? (item.release_date ? new Date(item.release_date).getFullYear() : null) : 
                        'first_air_date' in item ? (item.first_air_date ? new Date(item.first_air_date).getFullYear() : null) : null;
            const badges = generateBadges(item);
            const genres = getGenreName(item.genre_ids || []);
            const runtime = getRuntime(item);

            return (
              <div
                key={item.id}
                className="flex-shrink-0 group/card"
              >
                <div className="relative w-36 md:w-40 lg:w-44 aspect-[2/3]">
                  {/* Card Container */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                    onClick={() => {
                      const mediaType = 'first_air_date' in item ? 'tv' : 'movie';
                      router.push(`/new-popular/${item.id}?type=${mediaType}`);
                    }}
                  >
                    {/* Poster */}
                    <div className="relative w-full h-full">
                      {posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://picsum.photos/300/450?random=${item.id}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <span className="text-gray-400 text-lg font-medium">{title.charAt(0)}</span>
                        </div>
                      )}

                      {/* Badges */}
                      {badges.length > 0 && (
                        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                          {badges.map((badge, badgeIndex) => (
                            <div
                              key={badgeIndex}
                              className={`${getBadgeColor(badge)} px-2 py-1 rounded text-white text-xs font-bold shadow-lg`}
                            >
                              {badge}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rating - Top Right */}
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-yellow-400 text-xs font-bold">{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          {/* Title */}
                          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{title}</h3>
                          
                          {/* Quick Info Tooltip */}
                          <div className="flex items-center gap-2 mb-3 text-xs text-white/80">
                            {year && <span>{year}</span>}
                            <span>•</span>
                            <span>{runtime}</span>
                            {genres.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{genres[0]}</span>
                              </>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mb-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const mediaType = 'first_air_date' in item ? 'tv' : 'movie';
                                router.push(`/new-popular/${item.id}?type=${mediaType}`);
                              }}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 w-[75%]"
                            >
                              <Play className="w-3 h-3" />
                              Play Now
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnchorRect(e.currentTarget.getBoundingClientRect());
                                setPopupMedia(item);
                              }}
                              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-300 w-[25%] flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {popupMedia && (
          <CollectionPopup
            media={popupMedia}
            anchorRect={anchorRect}
            onClose={() => setPopupMedia(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNewReleasesGrid;
