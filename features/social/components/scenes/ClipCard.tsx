"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Clip } from "@/lib/scenes/types";
import { FiPlay, FiClock, FiEye, FiHeart, FiRepeat } from "react-icons/fi";

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

  // Mock stats for premium feel
  const mockLikes = (parseInt(clip.views) || 50) > 1000 
    ? (Math.floor(parseInt(clip.views) / 4) + "K")
    : (Math.floor(Math.random() * 100) + 10 + "K");

  // Handle hover with 400ms delay for snappier feel
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverEffects(true);
    }, 400); 
  }, []);

  // Magnetic hover + dynamic lighting
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !lightRef.current || !showHoverEffects) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2; 
    const centerY = rect.height / 2;

    const moveX = ((x - centerX) / centerX) * 8;
    const moveY = ((y - centerY) / centerY) * 6;
    cardRef.current.style.transform = `perspective(800px) rotateY(${moveX}deg) rotateX(${-moveY}deg) scale(1.15)`;
    cardRef.current.style.zIndex = "50";

    lightRef.current.style.opacity = "1";
    lightRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(239, 68, 68, 0.3) 0%, rgba(249, 115, 22, 0.1) 40%, transparent 70%)`;
  }, [showHoverEffects]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowHoverEffects(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
      cardRef.current.style.zIndex = "1";
    }
    if (lightRef.current) {
      lightRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative w-[300px] sm:w-[320px] h-[180px] rounded-xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 group ${
        showHoverEffects ? "shadow-[0_20px_50px_rgba(239,68,68,0.3)]" : "shadow-xl"
      }`}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.2s cubic-bezier(0.33, 1, 0.68, 1), box-shadow 0.3s ease" }}
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
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          title={clip.title}
        />
      ) : (
        <img
          src={clip.thumbnail}
          alt={clip.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          loading="lazy"
        />
      )}

      {/* Hover glow border */}
      <div 
        className="absolute inset-0 rounded-xl border-2 transition-all duration-500 z-30 pointer-events-none"
        style={{
          borderColor: showHoverEffects ? 'rgba(239, 68, 68, 0.6)' : 'transparent',
        }}
      />

      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 z-40 transition-transform duration-500 origin-left"
        style={{ transform: showHoverEffects ? 'scaleX(1)' : 'scaleX(0)' }}
      />

      {/* Dark overlay gradients */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${
        showHoverEffects ? 'bg-black/40' : 'bg-gradient-to-t from-black/90 via-black/20 to-transparent'
      }`} />

      {/* Info overlay (Premium Style) */}
      <div 
        className="absolute inset-0 p-4 z-40 pointer-events-none flex flex-col justify-end transition-all duration-500"
        style={{
          opacity: showHoverEffects ? 1 : 0,
          transform: showHoverEffects ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        <div className="space-y-1 mb-2">
          <h3 className="text-white text-sm md:text-base font-bold line-clamp-1 leading-tight drop-shadow-lg uppercase tracking-tight">
            {clip.title}
          </h3>
          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider line-clamp-1">
            {clip.channel}
          </p>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 text-[11px] text-gray-200 font-bold">
            <span className="flex items-center gap-1.5">
              <FiEye className="text-red-500 text-xs" />
              {clip.views}
            </span>
            <span className="flex items-center gap-1.5">
              <FiHeart className="text-red-500 text-xs" />
              {mockLikes}
            </span>
            <FiRepeat className="text-gray-400 text-xs" />
          </div>
          
          <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
             <FiPlay className="text-white text-xs ml-0.5" />
          </button>
        </div>
      </div>

      {/* Duration badge (Visible when not expanded) */}
      {!showHoverEffects && (
        <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
          {clip.duration}
        </div>
      )}

      {/* Subtle play icon when NOT expanded but hovered */}
      {isHovered && !showHoverEffects && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <FiPlay className="text-white text-2xl ml-1" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
