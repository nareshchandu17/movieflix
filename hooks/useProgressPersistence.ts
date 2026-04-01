import { useEffect, useRef } from 'react';
import { usePlayerState } from './usePlayerState';

export function useProgressPersistence(contentId: string) {
  const { currentTime, duration, seek } = usePlayerState();
  const lastSavedTimeRef = useRef(0);
  const hasRestoredRef = useRef(false);

  // Load saved progress on mount
  useEffect(() => {
    if (!hasRestoredRef.current) {
      const savedProgress = localStorage.getItem(`progress_${contentId}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const savedTime = progress.currentTime || 0;
        const videoDuration = progress.duration || 0;
        
        // Only resume if we're more than 5% into the video and less than 95% complete
        if (savedTime > 0 && videoDuration > 0 && 
            savedTime / videoDuration > 0.05 && 
            savedTime / videoDuration < 0.95) {
          
          // Small delay to ensure video is ready
          setTimeout(() => {
            seek(savedTime);
            console.log(`🎬 Resumed from ${Math.floor(savedTime)}s for ${contentId}`);
          }, 1000);
        }
      }
      hasRestoredRef.current = true;
    }
  }, [contentId, seek]);

  // Save progress periodically
  useEffect(() => {
    // Save every 10 seconds to avoid spam
    if (currentTime - lastSavedTimeRef.current >= 10 || lastSavedTimeRef.current - currentTime >= 10) {
      const progressData = {
        contentId,
        currentTime,
        duration,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`progress_${contentId}`, JSON.stringify(progressData));
      console.log(`💾 Saved progress for ${contentId}: ${Math.floor(currentTime)}s / ${Math.floor(duration)}s`);
      
      lastSavedTimeRef.current = currentTime;
      
      // Mark as completed if watched 95% or more
      if (duration > 0 && currentTime / duration > 0.95) {
        const completedData = {
          ...progressData,
          completed: true,
          completedAt: Date.now()
        };
        localStorage.setItem(`completed_${contentId}`, JSON.stringify(completedData));
        console.log(`🎉 Marked ${contentId} as completed!`);
      }
    }
  }, [currentTime, contentId, duration]);
  
  // Save on unmount
  useEffect(() => {
    return () => {
      const finalTime = usePlayerState.getState().currentTime;
      const finalDuration = usePlayerState.getState().duration;
      
      const progressData = {
        contentId,
        currentTime: finalTime,
        duration: finalDuration,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`progress_${contentId}`, JSON.stringify(progressData));
      console.log(`💾 Final save on unmount for ${contentId}: ${Math.floor(finalTime)}s`);
    };
  }, [contentId]);
}
