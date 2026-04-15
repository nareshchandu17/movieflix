import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface RecommendationsSectionProps {
  className?: string;
}

const recommendations = [
  { id: 1, title: 'Void Echoes', match: 96, image: '/poster1.jpg' },
  { id: 2, title: 'The Echoes Within', match: 94, image: '/poster2.jpg' },
  { id: 3, title: 'Ember Fall', match: 92, image: '/poster3.jpg' },
  { id: 4, title: 'Shadows of Doubt', match: 89, image: '/poster4.jpg' },
  { id: 5, title: 'Nightfall Home', match: 87, image: '/poster5.jpg' },
  { id: 6, title: 'Echoes of Tomorrow', match: 85, image: '/poster6.jpg' },
  { id: 7, title: 'Cybernetic Chasm', match: 83, image: '/poster7.jpg' },
  { id: 8, title: 'The Fall of Numantia', match: 81, image: '/poster8.jpg' },
];

export default function RecommendationsSection({ className = '' }: RecommendationsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Headline animation
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

      // Cards staggered animation
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
            stagger: 0.08,
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full min-h-screen py-20 lg:py-32 ${className}`}
      style={{
        background: '#07070A',
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(244,246,250,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244,246,250,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 px-6 lg:px-[18vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-4">
          <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
            Made For You
          </h2>
        </div>

        <p className="text-lg text-[#A7B0B7] mb-10 leading-relaxed max-w-xl">
          Titles that match your DNA—right now.
        </p>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {recommendations.map((movie) => (
            <div
              key={movie.id}
              className="recommendation-card group cursor-pointer"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-200/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-cyan/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-dark-200 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Match percentage */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-cyan/90 text-dark-200 text-xs font-bold">
                  {movie.match}%
                </div>

                {/* DNA bars at bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full flex-1"
                      style={{
                        backgroundColor: ['#29D7FF', '#FF2BD6', '#C7FF3D', '#7B4DFF', '#29D7FF'][i],
                        opacity: 0.6 + (i * 0.1),
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mt-3">
                <h3 className="text-sm font-medium text-[#F4F6FA] group-hover:text-cyan transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-xs text-[#A7B0B7]">Match {movie.match}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan/50 rounded-full px-8 group"
          >
            View All Recommendations
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
