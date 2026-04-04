import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface GenreMapSectionProps {
  className?: string;
  config?: {
    duration: number;
    ease: string;
    scrub: boolean | number;
    enabled: boolean;
  };
  scrollTriggerConfig?: {
    scrub: boolean | number;
    pinSpacing: boolean;
    invalidateOnRefresh: boolean;
    preventOverlaps: boolean;
    fastScrollEnd: boolean;
  };
}

const genreData = [
  { name: 'Thriller', value: 28, color: '#29D7FF' },
  { name: 'Sci-Fi', value: 24, color: '#FF2BD6' },
  { name: 'Drama', value: 22, color: '#C7FF3D' },
  { name: 'Comedy', value: 26, color: '#7B4DFF' },
];

export default function GenreMapSection({ 
  className = '',
  config = { duration: 0.6, ease: 'power2.out', scrub: 0.3, enabled: true },
  scrollTriggerConfig = {
    scrub: 0.3,
    pinSpacing: false,
    invalidateOnRefresh: true,
    preventOverlaps: true,
    fastScrollEnd: true
  }
}: GenreMapSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  const [chartAnimated, setChartAnimated] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Skip animations if disabled
      if (!config.enabled) {
        gsap.set([helixRef.current, headlineRef.current, chartRef.current, legendRef.current], { 
          opacity: 1, 
          x: 0, 
          scale: 1 
        });
        setChartAnimated(true);
        return;
      }

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          ...scrollTriggerConfig,
        },
      });

      // ENTRANCE (0% - 30%)
      scrollTl.fromTo(
        helixRef.current,
        { x: '-12vw', opacity: 0, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        chartRef.current,
        { x: '18vw', opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        legendRef.current?.children || [],
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
        0.05
      );

      // Trigger chart animation at 10%
      scrollTl.call(
        () => setChartAnimated(true),
        [],
        0.1
      );

      // SETTLE (30% - 70%) - elements hold position

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        helixRef.current,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, y: 0, opacity: 1 },
        { x: '-6vw', y: '-6vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        chartRef.current,
        { x: 0, opacity: 1 },
        { x: '10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        legendRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1 },
        { scale: 1.04, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full h-screen overflow-hidden taste-dna-section section-full-height ${className}`}
    >
      {/* Background Image with fallback */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full bg-fallback"
        style={{
          backgroundImage: 'url(/genre_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(7,7,10,0.92) 0%, rgba(7,7,10,0.55) 45%, rgba(7,7,10,0.25) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        {/* DNA Helix */}
        <div
          ref={helixRef}
          className="absolute left-[6vw] top-[10vh] hidden lg:block"
        >
    
        </div>

        {/* Left Content */}
        <div className="ml-[6vw] lg:ml-[18vw] max-w-[40vw]">
          {/* Headline */}
          <div ref={headlineRef} className="mb-4">
            <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
              Genre Map
            </h2>
          </div>

          <p className="text-lg text-[#A7B0B7] mb-8 leading-relaxed">
            Where your time goes—frame by frame.
          </p>

          {/* Legend */}
          <div ref={legendRef} className="flex flex-wrap gap-3 mb-6">
            {genreData.map((genre) => (
              <div
                key={genre.name}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <div
                  className="w-3 h-3 rounded-full"
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
            className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-6 font-semibold group"
          >
            <Settings className="w-4 h-4 mr-2" />
            Refine Preferences
          </Button>
        </div>

        {/* Chart Card */}
        <div
          ref={chartRef}
          className="absolute right-[6vw] lg:right-[8vw] top-1/2 -translate-y-1/2 w-[80vw] lg:w-[34vw] aspect-square max-w-[500px]"
        >
          <div className="dna-card w-full h-full flex items-center justify-center relative">
            {/* Grid lines background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(244,246,250,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(244,246,250,0.06) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />
            </div>

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
                <div className="text-4xl font-heading font-black text-[#F4F6FA]">4</div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#A7B0B7]">
                  Genres
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
