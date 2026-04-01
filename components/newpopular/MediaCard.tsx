"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Plus, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  index: number;
  layout?: "grid" | "carousel";
  showRank?: boolean;
  rank?: number;
}

const MediaCard = ({ 
  media, 
  index, 
  layout = "grid", 
  showRank = false, 
  rank = 0 
}: MediaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const title = 'title' in media ? media.title : media.name;
  const posterPath = media.poster_path;
  const voteAverage = media.vote_average;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  // Calculate runtime
  const getRuntime = () => {
    if ('runtime' in media && media.runtime) {
      return `${media.runtime} min`;
    }
    // For TV shows, simulate runtime
    return `${Math.floor(Math.random() * 60) + 30} min`;
  };
  const runtime = getRuntime();

  // Enhanced badges based on media properties
  const generateBadges = () => {
    const badges: { type: string; color: string }[] = [];
    const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
    const daysSinceRelease = releaseDate ? Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (showRank && rank <= 3) badges.push({ type: 'TOP ' + rank, color: 'bg-[#E50914]' });
    if (daysSinceRelease <= 30) badges.push({ type: 'NEW', color: 'bg-blue-500' });
    if (media.popularity > 1000) badges.push({ type: 'TRENDING', color: 'bg-red-500' });
    if (media.vote_average > 8) badges.push({ type: 'TOP RATED', color: 'bg-purple-500' });
    if (Math.random() > 0.85) badges.push({ type: 'EXCLUSIVE', color: 'bg-yellow-500' });
    if (Math.random() > 0.9) badges.push({ type: 'MUST WATCH', color: 'bg-green-500' });
    
    return badges;
  };
  const badges = generateBadges();

  const getBadgeLabel = (type: string) => {
    return type; // Direct return since we're using proper labels now
  };

  const cardClasses = `
    relative overflow-hidden cursor-pointer transition-all duration-300
    ${layout === 'grid' ? 'w-full aspect-[3/4] rounded-2xl' : 'w-[28rem] h-72 rounded-lg'}
    ${isHovered ? 'scale-110 shadow-2xl shadow-red-500/40 shadow-blue-500/30 z-10' : 'scale-100 shadow-lg shadow-black/20'}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cardClasses}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowDetails(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDetails(false);
      }}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
          {badges.map((badge, badgeIndex) => (
            <div
              key={badgeIndex}
              className={`${badge.color} px-2 py-1 rounded text-white text-xs font-bold`}
            >
              {getBadgeLabel(badge.type)}
            </div>
          ))}
        </div>
      )}

      {/* Rank Badge */}
      {showRank && rank && (
        <div className="absolute top-2 right-2 w-10 h-10 bg-[#E50914]/90 backdrop-blur-sm rounded-full flex items-center justify-center z-20">
          <span className="text-white font-bold text-lg">{rank}</span>
        </div>
      )}

      {/* Poster */}
      <div className="relative w-full h-full">
        {posterPath && !imageError ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#121826] to-[#1A2236] flex items-center justify-center">
            <span className="text-[#9CA3AF] text-lg font-medium">{title.charAt(0)}</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Title */}
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{title}</h3>
            
            {/* Metadata */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              {runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400">{runtime}</span>
                </div>
              )}
              {year && (
                <span className="text-[#9CA3AF]">{year}</span>
              )}
              {voteAverage > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">{voteAverage.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex-1 text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20"
              >
                <Play className="w-3 h-3 mr-1" />
                Play
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white w-8 h-8 p-0 rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 border border-red-400/20"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {/* Reduced Description */}
            {isHovered && media.overview && (
              <p className="text-white/80 text-xs mt-3 line-clamp-3 leading-relaxed">
                {media.overview.substring(0, 120)}...
              </p>
            )}

            {/* Genre Tags */}
            {isHovered && (
              <div className="flex flex-wrap gap-1 mt-2">
                {['Action', 'Drama', 'Thriller'].slice(0, Math.floor(Math.random() * 3) + 1).map((genre, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;
