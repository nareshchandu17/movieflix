import { useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  fps: number;
  isLowPerformance: boolean;
  frameTime: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    isLowPerformance: false,
    frameTime: 16.67
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();

  useEffect(() => {
    const checkPerformance = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        const fps = frameCount.current;
        const frameTime = 1000 / fps;
        const isLowPerformance = fps < 50; // Consider low performance below 50fps
        
        setMetrics({
          fps,
          isLowPerformance,
          frameTime
        });
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId.current = requestAnimationFrame(checkPerformance);
    };
    
    checkPerformance();
    
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return metrics;
}

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export function useOptimizedAnimation() {
  const performance = usePerformanceMonitor();
  const prefersReducedMotion = useReducedMotion();
  
  const getAnimationConfig = () => {
    if (prefersReducedMotion) {
      return {
        duration: 0,
        ease: 'none',
        scrub: false,
        enabled: false
      };
    }
    
    if (performance.isLowPerformance) {
      return {
        duration: 0.3,
        ease: 'power2.out',
        scrub: 0.2,
        enabled: true
      };
    }
    
    return {
      duration: 0.6,
      ease: 'power2.out',
      scrub: 0.3,
      enabled: true
    };
  };
  
  return {
    ...performance,
    prefersReducedMotion,
    config: getAnimationConfig()
  };
}

export function useScrollTriggerOptimization() {
  const { isLowPerformance, config } = useOptimizedAnimation();
  
  const getScrollTriggerConfig = (additionalConfig = {}) => {
    return {
      scrub: config.scrub,
      pinSpacing: false,
      invalidateOnRefresh: true,
      preventOverlaps: true,
      fastScrollEnd: true,
      ...additionalConfig
    };
  };
  
  return {
    isLowPerformance,
    config,
    getScrollTriggerConfig
  };
}
