"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useAutoPlay = (
  videoRef: React.RefObject<HTMLVideoElement>,
  shouldAutoPlay: boolean,
  hasUserInteracted: boolean,
  isVisible: boolean
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (!videoRef.current || !shouldAutoPlay || hasUserInteracted) return;

    autoPlayTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && isVisible) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log('Auto-play failed:', error);
          });
      }
    }, 1500); // 1.5 second delay
  }, [videoRef, shouldAutoPlay, hasUserInteracted, isVisible]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [videoRef, isPlaying]);

  const handleVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleVideoError = useCallback(() => {
    console.log('Video failed to load');
    setVideoReady(false);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (shouldAutoPlay && !hasUserInteracted && videoReady) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [shouldAutoPlay, hasUserInteracted, videoReady, startAutoPlay, stopAutoPlay]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else if (!document.hidden && shouldAutoPlay && !hasUserInteracted && videoReady) {
        setTimeout(() => {
          if (videoRef.current && isVisible) {
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
  }, [isPlaying, shouldAutoPlay, hasUserInteracted, videoReady, isVisible]);

  return {
    isPlaying,
    videoReady,
    handleVideoReady,
    handleVideoError,
    setIsPlaying
  };
};
