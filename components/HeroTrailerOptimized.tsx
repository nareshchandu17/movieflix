"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Volume2, VolumeX, Plus } from 'lucide-react';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { useVisibility, useDeviceDetection, useLocalStorage } from '@/hooks/useDeviceDetection';

interface HeroTrailerProps {
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  contentId: string;
  className?: string;
}

const HeroTrailerOptimized = ({ 
  title, 
  description, 
  videoUrl, 
  posterUrl, 
  contentId,
  className = ""
}: HeroTrailerProps) => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // Custom hooks
  const isVisible = useVisibility(containerRef, 0.5);
  const { isMobile, networkSlow, isLowPowerMode } = useDeviceDetection();
  const [isMuted, setIsMuted] = useLocalStorage('heroTrailerMuted', true);

  // Auto-play logic
  const shouldAutoPlay = !isMobile && !networkSlow && !isLowPowerMode && isVisible;
  const { isPlaying, videoReady, handleVideoReady, handleVideoError, setIsPlaying } = useAutoPlay(
    videoRef,
    shouldAutoPlay,
    hasUserInteracted,
    isVisible
  );

  // Event handlers
  const handlePlayClick = () => {
    setHasUserInteracted(true);
    router.push(`/watch/${contentId}`);
  };

  const handleAddToList = () => {
    setHasUserInteracted(true);
    console.log('Added to list:', contentId);
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoClick = () => {
    setHasUserInteracted(true);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        });
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
    >
      {/* Background Video/Poster */}
      <div className="absolute inset-0">
        {/* Poster Image (always visible as fallback) */}
        <img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
        />
        
        {/* Video (overlays poster when ready) */}
        <AnimatePresence>
          {shouldAutoPlay && videoReady && (
            <motion.video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onLoadedData={handleVideoReady}
              onError={handleVideoError}
              onClick={handleVideoClick}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              style={{ zIndex: 2 }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
          style={{ zIndex: 3 }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          style={{ zIndex: 3 }}
        />

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-black/10"
          style={{ zIndex: 4 }}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div 
        className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8"
        style={{ zIndex: 5 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl text-white"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg text-gray-300 mb-6 line-clamp-3 max-w-2xl"
          >
            {description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-3"
          >
            <Button
              size="default"
              className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              onClick={handlePlayClick}
            >
              <Play className="mr-2 h-5 w-5" />
              Play
            </Button>

            <Button
              variant="outline"
              size="default"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              onClick={handleAddToList}
            >
              <Plus className="mr-2 h-5 w-5" />
              My List
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Audio Controls */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 right-8 z-20"
          >
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Play Button (when video doesn't auto-play) */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-6 rounded-full transition-all duration-200 hover:scale-110"
            onClick={handlePlayClick}
          >
            <Play className="h-8 w-8" />
          </Button>
        </motion.div>
      )}

      {/* Loading indicator */}
      {!videoReady && shouldAutoPlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-8 right-8 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20"
        >
          Loading trailer...
        </motion.div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs z-30">
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Slow Network: {networkSlow ? 'Yes' : 'No'}</div>
          <div>Low Power: {isLowPowerMode ? 'Yes' : 'No'}</div>
          <div>Visible: {isVisible ? 'Yes' : 'No'}</div>
          <div>Auto-play: {shouldAutoPlay ? 'Yes' : 'No'}</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default HeroTrailerOptimized;
