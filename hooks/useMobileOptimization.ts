/**
 * Mobile optimization hooks for Watch Party performance
 * Features: Responsive video grid, touch controls, bandwidth optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaQuery } from './useMediaQuery';

interface MobileOptimizationState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
  bandwidthOptimized: boolean;
  touchEnabled: boolean;
  viewportSize: { width: number; height: number };
  videoQuality: 'low' | 'medium' | 'high' | 'auto';
  gridSize: 'single' | 'double' | 'grid';
}

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'swipe' | 'pinch' | 'long-press';
  direction?: 'left' | 'right' | 'up' | 'down';
  scale?: number;
  duration: number;
}

export function useMobileOptimization(): MobileOptimizationState & {
  optimizeVideoQuality: (connectionSpeed?: string) => void;
  handleTouchGesture: (gesture: TouchGesture) => void;
  getOptimalGridSize: (participantCount: number) => string;
  toggleBandwidthOptimization: () => void;
} {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    connectionType: 'unknown',
    bandwidthOptimized: false,
    touchEnabled: false,
    viewportSize: { width: 1920, height: 1080 },
    videoQuality: 'auto',
    gridSize: 'grid'
  });

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const touchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  // Detect device capabilities and network
  useEffect(() => {
    const updateDeviceState = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const connectionType = connection?.effectiveType || 'unknown';
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setState(prev => ({
        ...prev,
        isMobile,
        isTablet,
        isDesktop,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        connectionType,
        touchEnabled,
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        bandwidthOptimized: prev.bandwidthOptimized || connectionType === 'slow-2g' || connectionType === '2g'
      }));

      // Auto-optimize based on connection
      if (connectionType === 'slow-2g' || connectionType === '2g') {
        optimizeVideoQuality(connectionType);
      }
    };

    updateDeviceState();

    // Listen for network changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateDeviceState);
    }

    // Listen for orientation changes
    window.addEventListener('resize', updateDeviceState);
    window.addEventListener('orientationchange', updateDeviceState);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateDeviceState);
      }
      window.removeEventListener('resize', updateDeviceState);
      window.removeEventListener('orientationchange', updateDeviceState);
    };
  }, [isMobile, isTablet, isDesktop]);

  const optimizeVideoQuality = useCallback((connectionSpeed?: string) => {
    const connection = connectionSpeed || state.connectionType;
    let quality: 'low' | 'medium' | 'high' | 'auto' = 'auto';

    switch (connection) {
      case 'slow-2g':
      case '2g':
        quality = 'low';
        break;
      case '3g':
        quality = 'medium';
        break;
      case '4g':
      case 'wifi':
        quality = state.isMobile ? 'medium' : 'high';
        break;
      default:
        quality = state.isMobile ? 'medium' : 'auto';
    }

    setState(prev => ({ ...prev, videoQuality: quality }));
  }, [state.connectionType, state.isMobile]);

  const getOptimalGridSize = useCallback((participantCount: number): string => {
    const { isMobile, isTablet, orientation } = state;

    if (isMobile) {
      if (participantCount <= 2) return 'single';
      if (participantCount <= 4 && orientation === 'landscape') return 'double';
      return 'single'; // Stack vertically on mobile
    }

    if (isTablet) {
      if (participantCount <= 4) return 'double';
      if (participantCount <= 6) return 'grid';
      return 'grid';
    }

    // Desktop
    if (participantCount <= 1) return 'single';
    if (participantCount <= 4) return 'double';
    return 'grid';
  }, [state]);

  const handleTouchGesture = useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'double-tap':
        // Toggle fullscreen for tapped video
        break;
      case 'swipe':
        // Navigate between videos or change layout
        break;
      case 'pinch':
        // Zoom in/out on video grid
        break;
      case 'long-press':
        // Show video controls menu
        break;
    }
  }, []);

  const toggleBandwidthOptimization = useCallback(() => {
    setState(prev => {
      const newOptimized = !prev.bandwidthOptimized;
      if (newOptimized) {
        optimizeVideoQuality('2g'); // Force low quality
      } else {
        optimizeVideoQuality('wifi'); // Restore auto quality
      }
      return { ...prev, bandwidthOptimized: newOptimized };
    });
  }, [optimizeVideoQuality]);

  return {
    ...state,
    optimizeVideoQuality,
    handleTouchGesture,
    getOptimalGridSize,
    toggleBandwidthOptimization
  };
}

export function useTouchGestures() {
  const [gesture, setGesture] = useState<TouchGesture | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    // Check for double tap
    if (lastTouchRef.current && now - lastTouchRef.current.time < 300) {
      const distance = Math.sqrt(
        Math.pow(touch.clientX - lastTouchRef.current.x, 2) +
        Math.pow(touch.clientY - lastTouchRef.current.y, 2)
      );

      if (distance < 50) {
        setGesture({
          type: 'double-tap',
          duration: 0
        });
      }
    }

    lastTouchRef.current = touchStartRef.current;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const now = Date.now();
    const duration = now - touchStartRef.current.time;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Long press
    if (duration > 500 && distance < 10) {
      setGesture({
        type: 'long-press',
        duration
      });
      return;
    }

    // Swipe
    if (distance > 50 && duration < 300) {
      let direction: 'left' | 'right' | 'up' | 'down';
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setGesture({
        type: 'swipe',
        direction,
        duration
      });
      return;
    }

    // Tap
    if (distance < 10 && duration < 200) {
      setGesture({
        type: 'tap',
        duration
      });
    }

    touchStartRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Handle pinch gesture for zoom
    if (e.touches.length === 2 && touchStartRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      setGesture({
        type: 'pinch',
        scale: distance / 100, // Normalize scale
        duration: 0
      });
    }
  }, []);

  return {
    gesture,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove
  };
}

export function useBandwidthOptimization() {
  const [bandwidthMode, setBandwidthMode] = useState<'auto' | 'low' | 'medium' | 'high'>('auto');
  const [dataUsage, setDataUsage] = useState<{ total: number; video: number; audio: number }>({
    total: 0,
    video: 0,
    audio: 0
  });

  const optimizeForConnection = useCallback((connectionType: string) => {
    switch (connectionType) {
      case 'slow-2g':
        setBandwidthMode('low');
        return {
          videoBitrate: 100, // kbps
          audioBitrate: 32,
          resolution: { width: 320, height: 240 },
          frameRate: 15
        };
      case '2g':
        setBandwidthMode('low');
        return {
          videoBitrate: 250,
          audioBitrate: 48,
          resolution: { width: 480, height: 360 },
          frameRate: 20
        };
      case '3g':
        setBandwidthMode('medium');
        return {
          videoBitrate: 500,
          audioBitrate: 64,
          resolution: { width: 640, height: 480 },
          frameRate: 25
        };
      case '4g':
        setBandwidthMode('medium');
        return {
          videoBitrate: 1000,
          audioBitrate: 96,
          resolution: { width: 854, height: 480 },
          frameRate: 30
        };
      case 'wifi':
        setBandwidthMode('high');
        return {
          videoBitrate: 2000,
          audioBitrate: 128,
          resolution: { width: 1280, height: 720 },
          frameRate: 30
        };
      default:
        setBandwidthMode('auto');
        return {
          videoBitrate: 1000,
          audioBitrate: 96,
          resolution: { width: 854, height: 480 },
          frameRate: 30
        };
    }
  }, []);

  const trackDataUsage = useCallback((bytes: number, type: 'video' | 'audio') => {
    setDataUsage(prev => ({
      ...prev,
      [type]: prev[type] + bytes,
      total: prev.total + bytes
    }));
  }, []);

  const getDataUsageStats = useCallback(() => {
    const mbUsed = (dataUsage.total / 1024 / 1024).toFixed(2);
    const videoPercent = dataUsage.total > 0 ? (dataUsage.video / dataUsage.total * 100).toFixed(1) : '0';
    const audioPercent = dataUsage.total > 0 ? (dataUsage.audio / dataUsage.total * 100).toFixed(1) : '0';

    return {
      totalMB: mbUsed,
      videoPercent,
      audioPercent,
      bandwidthMode
    };
  }, [dataUsage, bandwidthMode]);

  return {
    bandwidthMode,
    dataUsage,
    optimizeForConnection,
    trackDataUsage,
    getDataUsageStats
  };
}
