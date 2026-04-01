import { useEffect, useRef } from 'react';
import { usePlayerState } from './usePlayerState';

export function useAutoHideControls(timeoutMs = 4000) {
  const { playing, activePanel, showControls, hideControls } = usePlayerState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Determine if controls should be visible initially (e.g. paused or panel open)
    if (!playing || activePanel) {
      showControls();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const resetTimer = () => {
      showControls();
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Only hide if playing and no panels are open
      if (playing && !activePanel) {
        timerRef.current = setTimeout(() => {
          hideControls();
        }, timeoutMs);
      }
    };

    // Initial timer start
    resetTimer();

    // Listen for mouse movement to keep controls alive
    const area = document.getElementById('player-root');
    if (area) {
      area.addEventListener('mousemove', resetTimer);
      area.addEventListener('click', resetTimer);
      area.addEventListener('touchstart', resetTimer); // Mobile
      
      return () => {
        area.removeEventListener('mousemove', resetTimer);
        area.removeEventListener('click', resetTimer);
        area.removeEventListener('touchstart', resetTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [playing, activePanel, showControls, hideControls, timeoutMs]);
}
