"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ActressCardProps {
  name: string;
  profileURL: string;
  id: number;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ActressCard: React.FC<ActressCardProps> = ({
  name,
  profileURL,
  id,
  size = "medium",
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: "w-20 h-20",
    medium: "w-36 h-36",
    large: "w-44 h-44",
  };

  const imageSize = {
    small: 80,
    medium: 160,
    large: 200,
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displayName = imageError ? "Actress" : name;

  return (
    <Link href={`/actresses/${id}`} className="block group/actress-card">
      <div className={`flex flex-col items-center space-y-3 transition-all duration-300 ${className}`}>
        {/* Actress Image with Premium Effects */}
        <div className="relative">
          {/* Glow Effect */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl opacity-0 group-hover/actress-card:opacity-100 transition-opacity duration-300 ${sizeClasses[size]}`}
          />
          
          {/* Image Container */}
          <div 
            className={`relative rounded-full overflow-hidden border-2 border-white/10 backdrop-blur-sm transition-all duration-300 group-hover/actress-card:scale-105 group-hover/actress-card:border-white/30 group-hover/actress-card:shadow-2xl group-hover/actress-card:shadow-pink-500/20 ${sizeClasses[size]}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageError ? "https://i.imgur.com/wjVuAGb.png" : profileURL}
              alt={displayName}
              width={imageSize[size]}
              height={imageSize[size]}
              className="object-cover transition-transform duration-300 group-hover/actress-card:scale-110"
              onError={handleImageError}
              unoptimized
              style={{ objectPosition: 'center' }}
            />
            
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/actress-card:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Pulse Animation */}
          {isHovered && (
            <div className={`absolute inset-0 rounded-full border-2 border-pink-500/30 animate-ping ${sizeClasses[size]}`} />
          )}
        </div>

        {/* Actress Name */}
        <div className="text-center">
          <h3 className={`text-white text-sm font-medium group-hover/actress-card:text-pink-400 transition-colors duration-300 line-clamp-1`}>
            {displayName}
          </h3>
          <p className="text-gray-500 text-xs mt-1 group-hover/actress-card:text-gray-400 transition-colors duration-300">
            Actress
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ActressCard;
