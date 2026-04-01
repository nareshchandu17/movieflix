"use client";

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Plus, Star, Clock, ChevronDown } from 'lucide-react';
import type { Movie } from './types';

interface MovieCardProps {
  movie: Movie;
  index: number;
  variant?: 'default' | 'expiring';
}

export function MovieCard({ movie, index, variant = 'default' }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsHovered(false);
      mouseX.set(0);
      mouseY.set(0);
    }, 100);
  };
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, rotateY: -30 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => {
        setTimeout(() => {
          setIsHovered(true);
        }, 1000);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        zIndex: isHovered ? 50 : 1,
      }}
      className="relative flex-shrink-0 w-[280px] cursor-pointer group"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.15 : 1,
          y: isHovered ? -10 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`
          relative rounded-xl overflow-hidden
          transition-shadow duration-400
          ${isHovered ? 'card-glow-hover' : 'card-glow'}
        `}
      >
        {/* Poster Image */}
        <div className="relative aspect-video overflow-hidden">
          <motion.img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Play Button Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-14 h-14 rounded-full bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/40"
            >
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </motion.button>
          </motion.div>
          
          {/* Expiry Badge */}
          {variant === 'expiring' && movie.expiryInfo && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#E50914] rounded-md text-xs font-semibold text-white">
              {movie.expiryInfo}
            </div>
          )}
          
          {/* Progress Bar */}
          {movie.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#333]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${movie.progress}%` }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-[#E50914] shimmer relative"
              />
            </div>
          )}
        </div>
        
        {/* Card Info - Always Visible */}
        <div className="p-3 bg-gradient-to-b from-black/60 to-black">
          <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
          
          {movie.episodeInfo && (
            <p className="text-xs text-[#B3B3B3] mt-1">{movie.episodeInfo}</p>
          )}
        </div>
        
        {/* Expanded Info on Hover */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isHovered ? 'auto' : 0,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden bg-black"
        >
          <div className="p-3 pt-0 space-y-2">
            {/* Rating & Meta */}
            <div className="flex items-center gap-3 text-xs">
              {movie.rating && (
                <div className="flex items-center gap-1 text-[#FFD700]">
                  <Star className="w-3.5 h-3.5 fill-[#FFD700]" />
                  <span className="font-semibold">{movie.rating}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center gap-1 text-[#B3B3B3]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{movie.runtime}</span>
                </div>
              )}
              {movie.year && (
                <span className="text-[#B3B3B3]">{movie.year}</span>
              )}
            </div>
            
            {/* Genres */}
            {movie.genres && (
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 text-[10px] font-medium text-white/70 bg-white/10 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#E50914] rounded-md text-xs font-semibold text-white hover:bg-[#B20710] transition-colors">
                <Play className="w-3.5 h-3.5 fill-white" />
                Play
              </button>
              <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Reflection Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute -bottom-20 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
          transform: 'scaleY(-1)',
          maskImage: 'linear-gradient(to bottom, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
        }}
      >
        <img
          src={movie.poster}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
      </motion.div>
    </motion.div>
  );
}
