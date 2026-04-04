"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { Play, Plus, ThumbsUp, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CollectionPopup from "../collections/CollectionPopup";
import { AnimatePresence } from "framer-motion";

// Type guard function
function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return "first_air_date" in item && item.first_air_date !== undefined;
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
    // Navigate to watch page
    router.push(`/watch/${media.id}`);
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
    const baseClasses = "relative flex-shrink-0 scroll-snap-align-start transition-all duration-300";
    
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
          className="cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] w-[160px] sm:w-[180px] md:w-[200px] rounded-xl overflow-hidden">
            <Image
              src={poster_path}
              alt={`${titleVal} ${isTV ? "TV series" : "movie"} poster`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 200px"
              className="object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
            
            {/* Individual hover overlay with 1-second delay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 delay-150">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{titleVal}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-white text-xs">{media.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <span className="text-white/70 text-xs">
                    {isTV 
                      ? (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'TV')
                      : (media.release_date ? new Date(media.release_date).getFullYear() : 'Movie')
                    }
                  </span>
                </div>
                
                {/* Buttons with 75% and 25% width */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-medium"
                    onClick={handlePlayClick}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play Now
                  </Button>
                  <Button 
                    ref={plusButtonRef}
                    size="sm" 
                    variant="outline" 
                    className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center"
                    onClick={handleAddClick}
                    title="add to watchlist"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
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
          className="cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden">
            <Image
              src={poster_path}
              alt={`${titleVal} ${isTV ? "TV series" : "movie"} poster`}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 200px"
              className="object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
            
            {/* Individual hover overlay with 1-second delay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 delay-150">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{titleVal}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-white text-xs">{media.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <span className="text-white/70 text-xs">
                    {isTV 
                      ? (media.first_air_date ? new Date(media.first_air_date).getFullYear() : 'TV')
                      : (media.release_date ? new Date(media.release_date).getFullYear() : 'Movie')
                    }
                  </span>
                </div>
                
                {/* Buttons with 75% and 25% width */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-medium"
                    onClick={handlePlayClick}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Play Now
                  </Button>
                  <Button 
                    ref={plusButtonRef}
                    size="sm" 
                    variant="outline" 
                    className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center"
                    onClick={handleAddClick}
                    title="add to watchlist"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
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
