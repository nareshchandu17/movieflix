'use client';

import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';

gsap.registerPlugin(ScrollTrigger);

interface MoodDistribution {
  label: string;
  value: number;
}

interface MoodRadarSectionProps {
  data: MoodDistribution[];
  className?: string;
}

export default function MoodRadarSection({ data, className = '' }: MoodRadarSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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

      tl.fromTo(titleRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1 }, 0);
      tl.fromTo(chartRef.current, { scale: 0.5, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0 }, 0.2);
      tl.fromTo(textRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1 }, 0.4);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`relative w-full h-screen bg-[#07070A] flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-violet/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <div ref={titleRef}>
            <h2 className="text-4xl lg:text-6xl font-heading font-black text-white uppercase tracking-tighter">
              Mood <span className="text-violet">Spectrum</span>
            </h2>
            <p className="text-gray-400 mt-4 text-lg lg:text-xl max-w-md">
              Your viewing habits reveal a complex emotional fingerprint. Here is how you navigate the spectrum of human feeling.
            </p>
          </div>

          <div ref={textRef} className="grid grid-cols-2 gap-4">
            {data.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-gray-400 text-sm uppercase tracking-wider">{item.label}</div>
                <div className="text-2xl font-bold text-white">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div ref={chartRef} className="lg:w-1/2 w-full h-[400px] lg:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#2A2A2E" />
              <PolarAngleAxis 
                dataKey="label" 
                tick={{ fill: '#A7B0B7', fontSize: 14, fontWeight: 500 }} 
              />
              <Radar
                name="Mood"
                dataKey="value"
                stroke="#7B4DFF"
                fill="#7B4DFF"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
