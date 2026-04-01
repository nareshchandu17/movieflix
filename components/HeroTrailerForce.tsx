"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Volume2, VolumeX, Plus } from 'lucide-react';

interface HeroTrailerProps {
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  contentId: string;
  className?: string;
}

const HeroTrailerForce = ({ 
  title, 
  description, 
  videoUrl, 
  posterUrl, 
  contentId,
  className = ""
}: HeroTrailerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoPlayTriggered, setAutoPlayTriggered] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<any>(null);
  const router = useRouter();

  // Check if mobile
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsMobile(isMobileDevice);
  }, []);

  // Force auto-play with multiple attempts
  useEffect(() => {
    if (!videoRef.current || isMobile || hasUserInteracted || autoPlayTriggered) return;

    const video = videoRef.current;
    let attempts = 0;
    const maxAttempts = 5;

    const forceAutoPlay = async () => {
      setAutoPlayTriggered(true);
      console.log(`🎬 Force auto-play attempt ${attempts + 1}/${maxAttempts}`);
      
      // Ensure video is properly configured
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      
      attempts++;

      try {
        // Method 1: Direct play with promise
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromiseRef.current = playPromise;
          await playPromise;
          console.log('✅ Auto-play successful!');
          setIsPlaying(true);
          return;
        }
      } catch (error1) {
        console.log(`❌ Attempt ${attempts} failed:`, error1);
        
        if (attempts >= maxAttempts) {
          console.log('🚫 All auto-play attempts failed');
          return;
        }

        // Try again with a delay
        setTimeout(() => {
          if (attempts < maxAttempts) {
            forceAutoPlay();
          }
        }, 1000 * attempts); // Increasing delay
      }
    };

    // Start immediately when component mounts
    const timer = setTimeout(() => {
      forceAutoPlay();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {}).catch(() => {});
      }
    };
  }, [isMobile, hasUserInteracted, autoPlayTriggered]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      console.log('📹 Video data loaded');
      setVideoReady(true);
    };

    const handleCanPlay = () => {
      console.log('▶️ Video can play');
      setVideoReady(true);
    };

    const handlePlay = () => {
      console.log('🎬 Video started playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Video paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('🏁 Video ended');
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      console.error('❌ Video error:', e);
      setVideoReady(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else if (!document.hidden && !isMobile && !hasUserInteracted && videoReady && !isPlaying) {
        // Resume when tab becomes visible
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                // Ignore play failures
              });
          }
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, isMobile, hasUserInteracted, videoReady]);

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

  // Manual play button for testing
  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          console.log('✅ Manual play successful');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('❌ Manual play failed:', error);
        });
    }
  };

  const shouldShowVideo = !isMobile && videoReady;

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
          {shouldShowVideo && (
            <motion.video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl}
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              autoPlay
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

            {/* Debug: Manual Play Button */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={handleManualPlay}
              >
                Force Play
              </Button>
            )}
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
      {!videoReady && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-8 right-8 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20"
        >
          Loading trailer...
        </motion.div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs z-30">
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Video Ready: {videoReady ? 'Yes' : 'No'}</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
          <div>Interacted: {hasUserInteracted ? 'Yes' : 'No'}</div>
          <div>Auto-play Triggered: {autoPlayTriggered ? 'Yes' : 'No'}</div>
          <div>Video URL: {videoUrl}</div>
        </div>
      )}
    </div>
  );
};

export default HeroTrailerForce;
