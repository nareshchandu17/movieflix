'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface RecommendationsSectionProps {
  recommendations: string[];
  className?: string;
}

export default function RecommendationsSection({ recommendations, className = '' }: RecommendationsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const cards = gridRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, [recommendations]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full min-h-screen py-20 lg:py-32 bg-[#07070A] ${className}`}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(244,246,250,0.05) 1px, transparent 0)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 px-6 lg:px-[18vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-12">
          <div className="flex items-center gap-2 text-cyan font-mono text-sm uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            AI Synthesis Complete
          </div>
          <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
            Your Narrative <span className="text-cyan">Matches</span>
          </h2>
          <p className="text-lg text-[#A7B0B7] mt-6 leading-relaxed max-w-xl">
            Based on your identified traits, these titles represent the perfect intersection of your past interests and future exploration.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {recommendations.map((title, i) => (
            <div
              key={i}
              className="recommendation-card group cursor-pointer"
            >
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-cyan/30 transition-colors duration-500">
                {/* Visual Placeholder for dynamic posters */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-200 to-dark-100 flex items-center justify-center">
                   <div className="text-white/20 font-heading font-black text-4xl uppercase opacity-10 group-hover:opacity-20 transition-opacity">
                     {title}
                   </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent opacity-60" />

                {/* Match percentage simulation */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan text-dark-200 text-xs font-bold shadow-lg">
                  {98 - (i * 2)}% Match
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-white text-dark-200 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan transition-colors truncate mb-1">
                    {title}
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-xs font-mono text-cyan uppercase">Premium Match</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">Available in 4K</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 rounded-full px-12 group h-14"
            onClick={() => window.location.href = '/home'}
          >
            Explore Full Library
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
