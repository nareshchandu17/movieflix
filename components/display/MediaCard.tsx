"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { Play, Plus, Star, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return "first_air_date" in item && item.first_air_date !== undefined;
}

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  variant?: "horizontal" | "grid";
  className?: string;
  hoveredMovieId?: number | null;
  setHoveredMovieId?: (id: number | null) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  variant = "grid",
  className = "",
  hoveredMovieId,
  setHoveredMovieId,
}) => {
  const [imageError, setImageError] = useState(false);

  const isTV = isTVShow(media);
  const href = isTV ? `/series/${media.id}` : `/movie/${media.id}`;
  const titleVal = isTV ? media.name : media.title;
  const isHovered = hoveredMovieId === media.id;

  const poster_path = media.poster_path
    ? `https://image.tmdb.org/t/p/w780/${media.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  const getCardClasses = () => {
    const base =
      "relative rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-black/40";
    const style =
      "border border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm";

    if (variant === "horizontal") {
      return `w-[160px] sm:w-[180px] md:w-[200px] ${base} ${style} ${className}`;
    }

    return `w-full overflow-hidden ${base} ${style} ${className}`;
  };

  const handleMouseEnter = () => {
    if (setHoveredMovieId) setHoveredMovieId(media.id);
  };

  const handleMouseLeave = () => {
    if (setHoveredMovieId) setHoveredMovieId(null);
  };

  return (
    <motion.div
      className={getCardClasses()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => {
        // Only navigate if we're not clicking a button
        if (!(window.getSelection()?.toString())) {
          window.location.href = href;
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden rounded-xl">
        <Image
          src={poster_path}
          alt={`${titleVal} poster`}
          width={342}
          height={513}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          unoptimized
        />

        {/* Enhanced Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />

              {/* Content container */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 gap-3">

                {/* Movie Info */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-sm line-clamp-2">
                    {titleVal}
                  </h3>

                  {media.overview && (
                    <p className="text-gray-300 text-xs line-clamp-2">
                      {media.overview}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs">
                    {media.vote_average > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 font-semibold">
                          {media.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}

                    <span className="text-gray-400 text-[10px]">
                      {isTV
                        ? (media as TMDBTVShow).first_air_date ? new Date((media as TMDBTVShow).first_air_date).getFullYear() : 'N/A'
                        : (media as TMDBMovie).release_date ? new Date((media as TMDBMovie).release_date).getFullYear() : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* Enhanced Buttons */}
                <div className="flex gap-2 pt-1">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = href;
                    }}
                    className="flex-1 bg-white hover:bg-gray-200 text-black px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-[11px] font-bold shadow-xl overflow-hidden relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Now</span>
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="bg-zinc-800/90 hover:bg-zinc-700 text-white p-2.5 rounded-lg flex items-center justify-center transition-all duration-300 shadow-xl border border-white/5 active:scale-90"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    title="Add to List"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Always Visible Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {media.vote_average > 0 && (
            <div className="absolute top-2 left-2">
              <motion.div
                className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-2xl"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-3 h-3 text-red-500 fill-current" />
                <span className="text-white text-[10px] font-bold">
                  {media.vote_average.toFixed(1)}
                </span>
              </motion.div>
            </div>
          )}

          {variant === "grid" && (
            <div className="absolute bottom-2 left-2 right-2">
              <motion.div
                className="bg-black/60 backdrop-blur-xl px-2.5 py-2 rounded-lg border border-white/10 shadow-2xl group/info"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white text-[11px] font-bold line-clamp-1 group-hover/info:text-red-500 transition-colors">
                    {titleVal}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[9px] font-medium">
                      {isTV
                        ? (media as TMDBTVShow).first_air_date ? new Date((media as TMDBTVShow).first_air_date).getFullYear() : 'N/A'
                        : (media as TMDBMovie).release_date ? new Date((media as TMDBMovie).release_date).getFullYear() : 'N/A'
                      }
                    </span>
                    <div className="w-1 h-1 bg-gray-600 rounded-full" />
                    <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">
                      {isTV ? 'Series' : 'Movie'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;
