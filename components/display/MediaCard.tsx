"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { Play, Plus, Star } from "lucide-react";

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
      "relative rounded-lg transition-all duration-300 transform hover:scale-105";
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
    <div
      className={getCardClasses()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} title={titleVal} className="block w-full">
        <div className="aspect-[2/3] w-full relative overflow-hidden rounded-lg">
          <Image
            src={poster_path}
            alt={`${titleVal} poster`}
            width={342}
            height={513}
            className="w-full h-full object-cover"
            unoptimized
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 z-20 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent" />

            {/* Content container */}
            <div className="absolute inset-0 flex flex-col justify-end p-3 gap-2">
              
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

                  {!isTV && (media as TMDBMovie).release_date && (
                    <span className="text-gray-300">
                      {new Date(
                        (media as TMDBMovie).release_date
                      ).getFullYear()}
                    </span>
                  )}

                  {isTV && (media as TMDBTVShow).first_air_date && (
                    <span className="text-gray-300">
                      {new Date(
                        (media as TMDBTVShow).first_air_date
                      ).getFullYear()}
                    </span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = href;
                  }}
                  className="flex-1 bg-white hover:bg-gray-200 text-black px-3 py-2 rounded-md flex items-center justify-center gap-1 transition-all duration-300 hover:scale-105 text-xs font-semibold"
                >
                  <Play className="w-3 h-3" />
                  Play Now
                </button>

                <button
                  onClick={(e) => e.preventDefault()}
                  className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-2 rounded-md flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Always Visible Overlay */}
          <div className="absolute inset-0 z-10">
            {media.vote_average > 0 && (
              <div className="absolute top-3 left-3">
                <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-green-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 text-green-400 fill-current" />
                  <span className="text-green-400 text-xs font-bold">
                    {media.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {variant === "grid" && (
              <div className="absolute bottom-3 left-3 space-y-1">
                <div className="w-fit bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md px-2 py-1 rounded-lg border border-blue-500/30">
                  <span className="text-white text-xs uppercase tracking-wider">
                    {isTV ? "Series" : "Movie"}
                  </span>
                </div>

                <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-gray-600/30">
                  <h3 className="text-white text-xs font-semibold line-clamp-2">
                    {titleVal}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MediaCard;