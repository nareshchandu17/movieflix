import { useEffect, useRef, useState } from 'react';
import { usePlayerState } from './usePlayerState';
import { toast } from 'sonner';

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isGesturing: boolean;
  gestureType: 'volume' | 'brightness' | null;
  initialValue: number;
}

export function useGestureControls() {
  const { setVolume, volume } = usePlayerState();
  const [brightness, setBrightness] = useState(1);
  const gestureState = useRef<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isGesturing: false,
    gestureType: null,
    initialValue: 0
  });
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if device is mobile
  const isMobileDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  useEffect(() => {
    if (!isMobileDevice()) return;

    const playerElement = document.getElementById('player-root');
    if (!playerElement) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only handle single finger gestures
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const rect = playerElement.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Determine gesture type based on touch position
      const isLeftSide = x < rect.width / 2;
      const gestureType = isLeftSide ? 'brightness' : 'volume';

      gestureState.current = {
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        isGesturing: true,
        gestureType,
        initialValue: gestureType === 'volume' ? volume : brightness
      };

      // Clear any existing indicator timeout
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gestureState.current.isGesturing || e.touches.length !== 1) return;

      e.preventDefault(); // Prevent scrolling during gesture

      const touch = e.touches[0];
      const rect = playerElement.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      gestureState.current.currentX = x;
      gestureState.current.currentY = y;

      const deltaY = gestureState.current.startY - y;
      const sensitivity = 200; // pixels for full range
      const deltaPercent = deltaY / sensitivity;

      if (gestureState.current.gestureType === 'volume') {
        const newVolume = Math.max(0, Math.min(1, gestureState.current.initialValue + deltaPercent));
        setVolume(newVolume);
        
        // Show volume indicator
        showGestureIndicator('🔊', Math.round(newVolume * 100), '%');
      } else if (gestureState.current.gestureType === 'brightness') {
        const newBrightness = Math.max(0.3, Math.min(1, gestureState.current.initialValue + deltaPercent));
        setBrightness(newBrightness);
        
        // Apply brightness to video
        const videoElement = playerElement.querySelector('video');
        if (videoElement) {
          videoElement.style.filter = `brightness(${newBrightness})`;
        }
        
        // Show brightness indicator
        showGestureIndicator('☀️', Math.round(newBrightness * 100), '%');
      }
    };

    const handleTouchEnd = () => {
      if (!gestureState.current.isGesturing) return;

      gestureState.current.isGesturing = false;
      gestureState.current.gestureType = null;

      // Hide indicator after a delay
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
      indicatorTimeoutRef.current = setTimeout(() => {
        hideGestureIndicator();
      }, 1000);
    };

    const showGestureIndicator = (icon: string, value: number, unit: string) => {
      // Remove existing indicator
      hideGestureIndicator();

      // Create indicator element
      const indicator = document.createElement('div');
      indicator.id = 'gesture-indicator';
      indicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-full flex items-center gap-3 z-[200] pointer-events-none';
      indicator.innerHTML = `
        <span class="text-2xl">${icon}</span>
        <span class="text-xl font-bold">${value}${unit}</span>
      `;

      document.body.appendChild(indicator);

      // Fade in animation
      setTimeout(() => {
        indicator.style.transition = 'opacity 0.2s';
        indicator.style.opacity = '1';
      }, 10);
    };

    const hideGestureIndicator = () => {
      const existing = document.getElementById('gesture-indicator');
      if (existing) {
        existing.style.opacity = '0';
        setTimeout(() => {
          existing.remove();
        }, 200);
      }
    };

    // Add event listeners
    playerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    playerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    playerElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      playerElement.removeEventListener('touchstart', handleTouchStart);
      playerElement.removeEventListener('touchmove', handleTouchMove);
      playerElement.removeEventListener('touchend', handleTouchEnd);
      hideGestureIndicator();
    };
  }, [volume, setVolume]);

  return { brightness };
}
