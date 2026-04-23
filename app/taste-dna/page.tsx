'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTasteDNA } from '@/hooks/useTasteDNA';

// Sections
import HeroSection from './sections/HeroSection';
import GenreMapSection from './sections/GenreMapSection';
import AISummarySection from './sections/AISummarySection';
import MoodRadarSection from './sections/MoodRadarSection';
import EvolutionSection from './sections/EvolutionSection';
import RecommendationsSection from './sections/RecommendationsSection';
import SocialComparisonSection from './sections/SocialComparisonSection';
import ClosingCTASection from './sections/ClosingCTASection';

gsap.registerPlugin(ScrollTrigger);

export default function TasteDNAPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { dna, isLoading, error } = useTasteDNA();

  useLayoutEffect(() => {
    // Wait for all sections to mount
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();

      if (mainRef.current) {
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
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [dna]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#07070A] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin" />
        <div className="text-cyan font-mono animate-pulse uppercase tracking-widest text-sm">Sequencing DNA...</div>
      </div>
    );
  }

  if (error || !dna) {
    return (
      <div className="w-full h-screen bg-[#07070A] flex flex-col items-center justify-center text-center px-6">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan to-transparent mb-8" />
        <h2 className="text-4xl font-heading font-black text-white mb-4 uppercase tracking-tighter">Sequence Incomplete</h2>
        <p className="text-gray-400 max-w-sm mb-12 leading-relaxed">
          Our AI needs more narrative data to synthesize your unique Taste DNA. Start your journey by watching a few more titles.
        </p>
        <button 
          onClick={() => window.location.href = '/home'}
          className="group relative px-8 py-3 bg-white text-dark-200 rounded-full font-bold uppercase tracking-wider overflow-hidden transition-transform hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">Initialize History</span>
          <div className="absolute inset-0 bg-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
    );
  }

  return (
    <main
      ref={mainRef}
      className="scroll-snap-container bg-[#07070A]"
    >
      {/* Visual Overlays */}
      <div className="grain-overlay" />

      {/* Experience Sections */}
      <HeroSection persona={dna.persona} personality={dna.personality} />
      <GenreMapSection genres={dna.genres} />
      <AISummarySection summary={dna.summary} persona={dna.persona} traits={dna.traits} />
      <MoodRadarSection data={dna.moodDistribution} />
      <EvolutionSection data={dna.evolution} />
      <RecommendationsSection recommendations={dna.recommendations} />
      <SocialComparisonSection />
      <ClosingCTASection />
    </main>
  );
}
