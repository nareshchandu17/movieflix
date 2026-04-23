'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Trend {
  label: string;
  change: number;
}

interface EvolutionSectionProps {
  data: {
    period: string;
    changes: Trend[];
  };
  className?: string;
}

export default function EvolutionSection({ data, className = '' }: EvolutionSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 1,
        },
      });

      tl.fromTo(titleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1 }, 0);
      tl.fromTo(".evolution-card", { 
        y: 100, 
        opacity: 0, 
        stagger: 0.1 
      }, { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1,
        ease: "power2.out"
      }, 0.2);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`relative w-full h-screen bg-[#07070A] flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-lime/5 to-transparent pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6">
        <div ref={titleRef} className="text-center mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Taste Evolution
          </div>
          <h2 className="text-4xl lg:text-7xl font-heading font-black text-white uppercase leading-none mb-6">
            Your Narrative <span className="text-lime">Trajectory</span>
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mx-auto">
            Viewing habits aren't static. In the {data.period}, your palate has shifted significantly across these dimensions.
          </p>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {data.changes.map((trend, i) => (
            <div 
              key={i} 
              className="evolution-card relative group p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-lime/30 transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="text-gray-400 font-medium tracking-wide uppercase text-sm">
                  {trend.label}
                </div>
                {trend.change >= 0 ? (
                  <div className="p-2 rounded-xl bg-lime/10 text-lime">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">
                  {Math.abs(trend.change)}%
                </span>
                <span className={trend.change >= 0 ? 'text-lime font-medium' : 'text-red-500 font-medium'}>
                  {trend.change >= 0 ? 'increase' : 'decrease'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-8 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${trend.change >= 0 ? 'bg-lime' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(trend.change) * 2, 100)}%` }}
                />
              </div>

              <div className="mt-4 text-gray-500 text-sm">
                Compared to last period
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
