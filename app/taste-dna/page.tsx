'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Sections
import HeroSection from './sections/HeroSection';
import GenreMapSection from './sections/GenreMapSection';
import AISummarySection from './sections/AISummarySection';
import RecommendationsSection from './sections/RecommendationsSection';
import SocialComparisonSection from './sections/SocialComparisonSection';
import ClosingCTASection from './sections/ClosingCTASection';

gsap.registerPlugin(ScrollTrigger);

export default function TasteDNAPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Wait for all sections to mount
    const timer = setTimeout(() => {
      // Refresh ScrollTrigger to ensure all section sizes are captured
      ScrollTrigger.refresh();

      // Add a subtle grain parallax effect if desired
      gsap.to(".grain-overlay", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: mainRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="scroll-snap-container"
    >
      {/* Visual Overlays */}
      <div className="grain-overlay" />

      {/* Experience Sections */}
      <HeroSection />
      <GenreMapSection />
      <AISummarySection />
      <RecommendationsSection />
      <SocialComparisonSection />
      <ClosingCTASection />
    </main>
  );
}
