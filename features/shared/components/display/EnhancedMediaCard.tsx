"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { Play, Plus, ThumbsUp, ChevronRight, Star } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CollectionPopup from "@/features/history/components/collections/CollectionPopup";
import { AnimatePresence } from "framer-motion";

// Type guard function
function isTVShow(item: any): item is TMDBTVShow {
  let mType = item.mediaType || item.media_type;
  if (!mType) {
    if ('first_air_date' in item && !('release_date' in item)) {
      mType = 'tv';
    } else if ('name' in item && !('title' in item)) {
      mType = 'tv';
    } else {
      mType = 'movie';
    }
  }
  return mType === 'tv' || mType === 'anime';
}

interface EnhancedMediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  variant?: "horizontal" | "grid";
  className?: string;
}

const EnhancedMediaCard: React.FC<EnhancedMediaCardProps> = ({
  media,
  variant = "horizontal",
  className = "",
}) => {
  const isTV = isTVShow(media);
  const router = useRouter();
  const href = isTV ? `/series/${media.id}` : `/movie/${media.id}`;
  const titleVal = isTV ? media.name : media.title;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | undefined>(undefined);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

  const handleCardClick = () => {
    router.push(href);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const typeStr = isTV ? 'series' : 'movie';
    // Navigate to watch page with type parameter
    router.push(`/watch/${media.id}?type=${typeStr}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plusButtonRef.current) {
      setAnchorRect(plusButtonRef.current.getBoundingClientRect());
    }
    setIsPopupOpen(!isPopupOpen);
  };

  const poster_path = media.poster_path
    ? (media.poster_path.startsWith('https://') 
        ? media.poster_path 
        : `https://image.tmdb.org/t/p/w342${media.poster_path}`)
    : "https://i.imgur.com/wjVuAGb.png";

  const backdrop_path = media.backdrop_path
    ? (media.backdrop_path.startsWith('https://') 
        ? media.backdrop_path 
        : `https://image.tmdb.org/t/p/w780${media.backdrop_path}`)
    : null;


  const getCardClasses = () => {
    const baseClasses = "relative z-10 hover:z-50 flex-shrink-0 scroll-snap-align-start transition-all duration-300";
    
    if (variant === "horizontal") {
      return `${baseClasses} ${className}`;
    } else {
      return `${baseClasses} ${className}`;
    }
  };

  const getCardContent = () => {
    if (variant === "horizontal") {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="cursor-pointer relative z-10 hover:z-50 transition-all duration-300 hover:scale-[1.15] hover:shadow-[0_0_30px_rgba(229,9,20,0.3)] group"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] w-[160px] sm:w-[180px] md:w-[200px] rounded-xl overflow-hidden bg-white/5">
            <Image
              src={poster_path}
              alt={`${titleVal} ${isTV ? "TV series" : "movie"} poster`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 200px"
              className="object-cover"
              loading="lazy"
            />
            
            {/* Individual hover overlay with immediate display */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5">
              <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{titleVal}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-xs">{media.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-white/70 text-xs">
                  {isTV 
                    ? (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'TV')
                    : (media.release_date ? new Date(media.release_date).getFullYear() : 'Movie')
                  }
                </span>
              </div>

              {media.overview && (
                <p className="text-white/80 text-[11px] line-clamp-2 mb-3 leading-snug font-normal">
                  {media.overview}
                </p>
              )}
              
              {/* Buttons with 75% and 25% width */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-bold shadow-lg"
                  onClick={handlePlayClick}
                >
                  <Play className="w-3 h-3 mr-1 fill-current" />
                  Play Now
                </Button>
                <Button 
                  ref={plusButtonRef}
                  size="sm" 
                  variant="outline" 
                  className="border-white/30 bg-black/40 hover:bg-white/20 hover:text-white hover:border-white/50 w-8 h-8 p-0 flex items-center justify-center"
                  onClick={handleAddClick}
                  title="add to watchlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isPopupOpen && (
                <CollectionPopup
                  media={media}
                  onClose={() => setIsPopupOpen(false)}
                  anchorRect={anchorRect}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    } else {
      // Grid variant with hover effect
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="cursor-pointer relative z-10 hover:z-50 transition-all duration-300 hover:scale-[1.15] hover:shadow-[0_0_30px_rgba(229,9,20,0.3)] group"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/5">
            <Image
              src={poster_path}
              alt={`${titleVal} ${isTV ? "TV series" : "movie"} poster`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 200px"
              className="object-cover"
              loading="lazy"
            />
            
            {/* Individual hover overlay with immediate display */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5">
              <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{titleVal}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-xs">{media.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-white/70 text-xs">
                  {isTV 
                    ? (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'TV')
                    : (media.release_date ? new Date(media.release_date).getFullYear() : 'Movie')
                  }
                </span>
              </div>

              {media.overview && (
                <p className="text-white/80 text-[11px] line-clamp-2 mb-3 leading-snug font-normal">
                  {media.overview}
                </p>
              )}
              
              {/* Buttons with 75% and 25% width */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-bold shadow-lg"
                  onClick={handlePlayClick}
                >
                  <Play className="w-3 h-3 mr-1 fill-current" />
                  Play Now
                </Button>
                <Button 
                  ref={plusButtonRef}
                  size="sm" 
                  variant="outline" 
                  className="border-white/30 bg-black/40 hover:bg-white/20 hover:text-white hover:border-white/50 w-8 h-8 p-0 flex items-center justify-center"
                  onClick={handleAddClick}
                  title="add to watchlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {isPopupOpen && (
                <CollectionPopup
                  media={media}
                  onClose={() => setIsPopupOpen(false)}
                  anchorRect={anchorRect}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className={getCardClasses()}>
      {getCardContent()}
    </div>
  );
};

export default EnhancedMediaCard;

