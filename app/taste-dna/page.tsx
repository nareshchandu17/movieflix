"use client";

import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

  useLayoutEffect(() => {
    // Wait for sections to mount and create their ScrollTriggers
    const timer = setTimeout(() => {
      // Ensure all DOM elements are rendered and measured
      ScrollTrigger.refresh();
      
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
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
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 1000); // Ensure all sections are fully mounted

    return () => {
      clearTimeout(timer);
      // Kill all ScrollTriggers created by this component
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  useEffect(() => {
    // Refresh ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up any remaining ScrollTriggers
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.pin) st.kill();
      });
    };
  }, []);

  return (
    <div ref={mainRef} className="relative bg-dark-200 taste-dna-container">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
    
      
      {/* Sections */}
      <main className="relative">
        <HeroSection className="z-10" />
        <GenreMapSection className="z-20" />
        <MoodRadarSection className="z-30" />
        <AISummarySection className="z-40" />
        <RecommendationsSection className="z-50" />
        <SocialComparisonSection className="z-50" />
        <ClosingCTASection className="z-60" />
      </main>
    </div>
  );
}
