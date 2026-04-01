"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Clip } from "@/lib/scenes/types";
import { FiPlay, FiClock, FiEye } from "react-icons/fi";

interface ClipCardProps {
  clip: Clip;
  onPlay: (clip: Clip) => void;
}

export default function ClipCard({ clip, onPlay }: ClipCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHoverEffects, setShowHoverEffects] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hover with 1-second delay
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Set timeout to show hover effects after 1 second
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverEffects(true);
    }, 1000);
  }, []);

  // Magnetic hover + dynamic lighting (only when hover effects are shown)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !lightRef.current || !showHoverEffects) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2; 
    const centerY = rect.height / 2;

    // Magnetic effect — subtle tilt toward cursor
    const moveX = ((x - centerX) / centerX) * 6;
    const moveY = ((y - centerY) / centerY) * 4;
    cardRef.current.style.transform = `perspective(600px) rotateY(${moveX}deg) rotateX(${-moveY}deg) scale(1.05)`;

    // Dynamic lighting — move spotlight to cursor position
    lightRef.current.style.opacity = "1";
    lightRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(239, 68, 68, 0.25) 0%, rgba(249, 115, 22, 0.1) 40%, transparent 70%)`;
  }, [showHoverEffects]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowHoverEffects(false);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    }
    if (lightRef.current) {
      lightRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative w-[300px] sm:w-[320px] h-[180px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition-shadow duration-300 group"
      style={{ transformStyle: "preserve-3d", transition: "transform 0.15s ease-out, box-shadow 0.3s ease" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPlay(clip)}
    >
      {/* Dynamic lighting overlay */}
      <div
        ref={lightRef}
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 rounded-xl"
        style={{ opacity: 0 }}
      />

      {/* Thumbnail or iframe preview */}
      {showHoverEffects ? (
        <iframe
          src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${clip.id}`}
          allow="autoplay; encrypted-media"
          className="w-full h-full border-0"
          loading="lazy"
          title={clip.title}
        />
      ) : (
        <img
          src={clip.thumbnail}
          alt={clip.title}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
      )}

      {/* Hover glow border with delayed transition */}
      <div 
        className="absolute inset-0 rounded-xl border border-transparent transition-all duration-1000 z-10 pointer-events-none"
        style={{
          borderColor: showHoverEffects ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
          transitionDelay: showHoverEffects ? '0ms' : '1000ms'
        }}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

      {/* Play button with delayed animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showHoverEffects ? 1 : 0 }}
        transition={{ 
          duration: 0.2,
          delay: showHoverEffects ? 0 : 0
        }}
      >
        <div className="w-12 h-12 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-red-500/30">
          <FiPlay className="text-white text-lg ml-0.5" />
        </div>
      </motion.div>

      {/* Info overlay with delayed appearance */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 z-20 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: showHoverEffects ? 1 : 0,
          transitionDelay: showHoverEffects ? '0ms' : '1000ms'
        }}
      >
        <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1.5 drop-shadow-lg">
          {clip.title}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-gray-300">
          <span className="flex items-center gap-1">
            <FiClock className="text-red-400" size={10} />
            {clip.duration}
          </span>
          <span className="flex items-center gap-1">
            <FiEye className="text-red-400" size={10} />
            {clip.views}
          </span>
          <span className="text-gray-400 truncate max-w-[120px]">{clip.channel}</span>
        </div>
      </div>

      {/* Duration badge with delayed hide */}
      <div 
        className="absolute top-2 right-2 z-20 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded transition-opacity duration-500"
        style={{
          opacity: showHoverEffects ? 0 : 1,
          transitionDelay: showHoverEffects ? '0ms' : '1000ms'
        }}
      >
        {clip.duration}
      </div>
    </div>
  );
}
