'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import DNAHelix from '@/components/DNAHelix';

gsap.registerPlugin(ScrollTrigger);

interface GenreMapSectionProps {
  genres: Record<string, number>;
  className?: string;
}

const COLORS = ['#29D7FF', '#FF2BD6', '#C7FF3D', '#7B4DFF', '#FFA500', '#00FF00'];

export default function GenreMapSection({ genres, className = '' }: GenreMapSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const [chartAnimated, setChartAnimated] = useState(false);

  // Convert Record<string, number> to Array<{name, value, color}>
  const genreData = Object.entries(genres).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      scrollTl.fromTo(helixRef.current, { x: '-12vw', opacity: 0, scale: 0.92 }, { x: 0, opacity: 1, scale: 1, ease: 'none' }, 0);
      scrollTl.fromTo(headlineRef.current, { x: '-10vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0);
      scrollTl.fromTo(chartRef.current, { x: '18vw', opacity: 0, scale: 0.96 }, { x: 0, opacity: 1, scale: 1, ease: 'none' }, 0);
      scrollTl.fromTo(legendRef.current?.children || [], { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.05);
      scrollTl.call(() => setChartAnimated(true), [], 0.1);

      // EXIT
      scrollTl.fromTo(helixRef.current, { x: 0, opacity: 1 }, { x: '-10vw', opacity: 0, ease: 'power2.in' }, 0.7);
      scrollTl.fromTo(headlineRef.current, { x: 0, y: 0, opacity: 1 }, { x: '-6vw', y: '-6vh', opacity: 0, ease: 'power2.in' }, 0.7);
      scrollTl.fromTo(chartRef.current, { x: 0, opacity: 1 }, { x: '10vw', opacity: 0, ease: 'power2.in' }, 0.7);
      scrollTl.fromTo(legendRef.current, { opacity: 1 }, { opacity: 0, ease: 'power2.in' }, 0.7);
      scrollTl.fromTo(bgRef.current, { scale: 1 }, { scale: 1.04, ease: 'power2.in' }, 0.7);
    }, section);

    return () => ctx.revert();
  }, [genres]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full h-screen overflow-hidden bg-[#07070A] ${className}`}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(41, 215, 255, 0.15) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        {/* DNA Helix */}
        <div
          ref={helixRef}
          className="absolute left-[6vw] top-[10vh] hidden lg:block"
        >
          <DNAHelix barCount={20} colorScheme="cyan" />
        </div>

        {/* Left Content */}
        <div className="ml-[6vw] lg:ml-[18vw] max-w-[40vw]">
          <div ref={headlineRef} className="mb-4">
            <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
              Genre <span className="text-cyan">Map</span>
            </h2>
          </div>

          <p className="text-lg text-[#A7B0B7] mb-8 leading-relaxed">
            Your narrative footprint across the cinematic landscape. 
          </p>

          {/* Legend */}
          <div ref={legendRef} className="flex flex-wrap gap-3 mb-6">
            {genreData.map((genre) => (
              <div
                key={genre.name}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: genre.color }}
                />
                <span className="text-sm text-[#F4F6FA]">
                  {genre.name} — {genre.value}%
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-[#A7B0B7] hover:bg-white/5 hover:text-[#F4F6FA] rounded-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            Historical Breakdown
          </Button>
        </div>

        {/* Chart Card */}
        <div
          ref={chartRef}
          className="absolute right-[6vw] lg:right-[8vw] top-1/2 -translate-y-1/2 w-[80vw] lg:w-[34vw] aspect-square max-w-[500px]"
        >
          <div className="dna-card w-full h-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={chartAnimated ? '55%' : '0%'}
                  outerRadius={chartAnimated ? '85%' : '0%'}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {genreData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-heading font-black text-[#F4F6FA]">{genreData.length}</div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#A7B0B7]">
                  Dimensions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
