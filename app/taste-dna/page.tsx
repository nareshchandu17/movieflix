"use client";

import { useEffect, useRef, useLayoutEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePerformanceMonitor, useOptimizedAnimation, useScrollTriggerOptimization } from '@/hooks/usePerformanceOptimization';
import '@/styles/taste-dna.css';
import '@/styles/taste-dna-anti-blink.css';

// Sections
import HeroSection from './HeroSection';
import GenreMapSection from './GenreMapSection';
import MoodRadarSection from './MoodRadarSection';
import AISummarySection from './AISummarySection';
import RecommendationsSection from './RecommendationsSection';
import SocialComparisonSection from './SocialComparisonSection';
import ClosingCTASection from './ClosingCTASection';

gsap.registerPlugin(ScrollTrigger);

export default function TasteDNAPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const performance = usePerformanceMonitor();
  const { prefersReducedMotion, config } = useOptimizedAnimation();
  const { getScrollTriggerConfig } = useScrollTriggerOptimization();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Prevent blinking with scroll stabilization
  const stabilizeScroll = useCallback(() => {
    setIsTransitioning(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset transition state after scroll stabilizes
    scrollTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  }, []);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    // Add GPU acceleration to main container
    main.style.transform = 'translateZ(0)';
    main.style.willChange = 'transform';

    // Skip complex animations if reduced motion is preferred
    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
      setIsLoaded(true);
      return;
    }

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Set consistent background
    document.body.style.background = '#07070a';
    
    // Wait for sections to mount and create their ScrollTriggers
    const timer = setTimeout(() => {
      // Ensure all DOM elements are rendered and measured
      ScrollTrigger.refresh();
      
      // Apply consistent ScrollTrigger settings to all sections
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.pin) {
          st.vars.pinSpacing = false; // Prevent black gaps
          st.vars.scrub = config.scrub; // Consistent scrub value
          st.vars.invalidateOnRefresh = false; // Prevent refresh flicker
          st.vars.preventOverlaps = true;
          st.vars.fastScrollEnd = true;
        }
      });
      
      // Add scroll event listener to prevent blinking
      const handleScroll = () => {
        stabilizeScroll();
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      ScrollTrigger.refresh(); // Refresh after updates
      
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      // Remove preload class by updating state immediately before any potential early returns
      setTimeout(() => {
        setIsLoaded(true);
      }, 50);

      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Optimized snap configuration
      const snapConfig = config.enabled ? {
        snapTo: (value: number) => {
          const inPinned = pinnedRanges.some(
            r => value >= r.start - 0.02 && value <= r.end + 0.02
          );
          if (!inPinned) return value;

          const target = pinnedRanges.reduce(
            (closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value)
                ? r.center
                : closest,
            pinnedRanges[0]?.center ?? 0
          );
          return target;
        },
        duration: { 
          min: performance.isLowPerformance ? 0.05 : 0.1, 
          max: performance.isLowPerformance ? 0.15 : 0.25 
        },
        delay: 0,
        ease: 'power2.out',
      } : undefined;

      ScrollTrigger.create({
        snap: snapConfig,
      });
    }, performance.isLowPerformance ? 200 : 500); // Faster init for low performance devices

    return () => {
      clearTimeout(timer);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', stabilizeScroll);
      
      // Reset scroll behavior
      document.documentElement.style.scrollBehavior = '';
      document.body.style.background = '';
      
      // Clean up main element styles
      if (main) {
        main.style.transform = '';
        main.style.willChange = 'auto';
      }
      // Kill all ScrollTriggers created by this component
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [prefersReducedMotion, config.enabled, performance.isLowPerformance]);

  useEffect(() => {
    // Refresh ScrollTrigger on resize with debounce
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, performance.isLowPerformance ? 100 : 150); // Faster debounce for low performance
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      // Clean up any remaining ScrollTriggers
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.pin) st.kill();
      });
    };
  }, [performance.isLowPerformance]);

  return (
    <div ref={mainRef} className={`relative bg-dark-200 taste-dna-container overflow-x-hidden ${isLoaded ? 'taste-dna-loaded gsap-initialized' : 'taste-dna-preload'}`}>
      {/* Performance Monitor (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-monitor">
          FPS: {performance.fps} | {performance.isLowPerformance ? 'LOW' : 'GOOD'}
        </div>
      )}
      
      {/* Grain Overlay */}
      <div className="grain-overlay pointer-events-none" />
    
      {/* Sections */}
      <main className="relative smooth-scroll-container">
        <HeroSection 
          className={`z-10 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`} 
        />
        <GenreMapSection 
          className={`z-20 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        <MoodRadarSection 
          className={`z-30 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        <AISummarySection 
          className={`z-40 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        <RecommendationsSection 
          className={`z-50 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        <SocialComparisonSection 
          className={`z-50 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        <ClosingCTASection 
          className={`z-60 taste-dna-section section-full-height section-background-stable ${isTransitioning ? 'is-transitioning' : ''}`}
        />
        
        {/* Blink prevention overlay */}
        {isTransitioning && (
          <div className="scroll-trigger-stable" />
        )}
      </main>
    </div>
  );
}
