import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface MoodRadarSectionProps {
  className?: string;
}

const moodData = [
  { subject: 'Suspense', A: 85, fullMark: 100 },
  { subject: 'Humor', A: 45, fullMark: 100 },
  { subject: 'Emotion', A: 70, fullMark: 100 },
  { subject: 'Intensity', A: 90, fullMark: 100 },
  { subject: 'Complexity', A: 75, fullMark: 100 },
];

export default function MoodRadarSection({ className = '' }: MoodRadarSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  const [radarAnimated, setRadarAnimated] = useState(false);

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

      // ENTRANCE (0% - 30%)
      scrollTl.fromTo(
        helixRef.current,
        { x: '-12vw', opacity: 0, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: '-12vw', opacity: 1, scale: 0.92 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: '-10vw', opacity: 1 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        chartRef.current,
        { x: '18vw', opacity: 1, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // Trigger radar animation at 10%
      scrollTl.call(
        () => setRadarAnimated(true),
        [],
        0.1
      );

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        helixRef.current,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: '-6vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        chartRef.current,
        { x: 0, opacity: 1 },
        { x: '10vw', opacity: 0, ease: 'power2.in' },
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
      className={`relative w-full h-screen overflow-hidden ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/mood_bg.jpg)',
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
              Mood Radar
            </h2>
          </div>

          <p className="text-lg text-[#A7B0B7] mb-8 leading-relaxed max-w-[34vw]">
            The feel of your favorites—plotted in real time.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-6 font-semibold group"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Adjust Mood Weights
          </Button>

          {/* Axis Labels (Mobile) */}
          <div className="mt-8 lg:hidden flex flex-wrap gap-2">
            {moodData.map((mood) => (
              <div
                key={mood.subject}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#A7B0B7]"
              >
                {mood.subject}: {mood.A}%
              </div>
            ))}
          </div>
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

            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <RadarChart width={400} height={400} cx="50%" cy="50%" outerRadius="70%" data={moodData}>
                  <PolarGrid 
                    stroke="rgba(244,246,250,0.08)" 
                    strokeWidth={1}
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#A7B0B7', fontSize: 12, fontFamily: 'Space Mono' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Mood"
                    dataKey="A"
                    stroke="#29D7FF"
                    strokeWidth={2}
                    fill="#29D7FF"
                    fillOpacity={0.18}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </RadarChart>
            </div>

            {/* Center glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan"
              style={{ boxShadow: '0 0 20px rgba(41, 215, 255, 0.6)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
