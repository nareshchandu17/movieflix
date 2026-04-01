"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ActorCardProps {
  name: string;
  profileURL: string;
  id: number;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ActorCard: React.FC<ActorCardProps> = ({
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

  const displayName = imageError ? "Actor" : name;

  return (
    <Link href={`/actors/${id}`} className="block group/actor-card">
      <div className={`flex flex-col items-center space-y-3 transition-all duration-300 ${className}`}>
        {/* Actor Image with Premium Effects */}
        <div className="relative">
          {/* Glow Effect */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-purple-500/20 blur-xl opacity-0 group-hover/actor-card:opacity-100 transition-opacity duration-300 ${sizeClasses[size]}`}
          />
          
          {/* Image Container */}
          <div 
            className={`relative rounded-full overflow-hidden border-2 border-white/10 backdrop-blur-sm transition-all duration-300 group-hover/actor-card:scale-105 group-hover/actor-card:border-white/30 group-hover/actor-card:shadow-2xl group-hover/actor-card:shadow-red-500/20 ${sizeClasses[size]}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageError ? "https://i.imgur.com/wjVuAGb.png" : profileURL}
              alt={displayName}
              width={imageSize[size]}
              height={imageSize[size]}
              className="object-cover transition-transform duration-300 group-hover/actor-card:scale-110"
              onError={handleImageError}
              unoptimized
            />
            
            {/* Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/actor-card:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Pulse Animation */}
          {isHovered && (
            <div className={`absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping ${sizeClasses[size]}`} />
          )}
        </div>

        {/* Actor Name */}
        <div className="text-center">
          <h3 className={`text-white text-sm font-medium group-hover/actor-card:text-red-400 transition-colors duration-300 line-clamp-1`}>
            {displayName}
          </h3>
          <p className="text-gray-500 text-xs mt-1 group-hover/actor-card:text-gray-400 transition-colors duration-300">
            Actor
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ActorCard;
