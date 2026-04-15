import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, TrendingUp, UserCheck, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SocialComparisonSectionProps {
  className?: string;
}

const comparisonData = [
  {
    id: 1,
    title: 'Friend Match',
    value: '78%',
    subtitle: 'With Alex Chen',
    icon: UserCheck,
    color: '#29D7FF',
    bars: [0.78, 0.65, 0.82, 0.71],
  },
  {
    id: 2,
    title: 'Community Avg',
    value: '62%',
    subtitle: 'Global average',
    icon: BarChart3,
    color: '#C7FF3D',
    bars: [0.62, 0.58, 0.65, 0.60],
  },
  {
    id: 3,
    title: 'Trending Shift',
    value: '+12%',
    subtitle: 'Sci-Fi growth',
    icon: TrendingUp,
    color: '#FF2BD6',
    bars: [0.45, 0.52, 0.61, 0.73],
  },
];

export default function SocialComparisonSection({ className = '' }: SocialComparisonSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Animate bars within cards
        cardsRef.current?.querySelectorAll('.bar-fill').forEach((bar, index) => {
          const targetHeight = comparisonData[index % 3]?.bars[Math.floor(index / 3)] || 0.5;
          gsap.fromTo(
            bar,
            { scaleY: 0 },
            {
              scaleY: targetHeight,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full py-20 lg:py-32 ${className}`}
      style={{
        background: '#0E1016',
      }}
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 px-6 lg:px-[18vw]">
        {/* Headline */}
        <div ref={headlineRef} className="text-center mb-4">
          <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
            Compare Taste
          </h2>
        </div>

        <p className="text-lg text-[#A7B0B7] mb-12 leading-relaxed text-center max-w-xl mx-auto">
          See how your DNA stacks up—with friends and the community.
        </p>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {comparisonData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="dna-card group hover:border-white/20 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className="w-5 h-5"
                        style={{ color: item.color }}
                      />
                      <span className="text-xs font-mono uppercase tracking-wider text-[#A7B0B7]">
                        {item.title}
                      </span>
                    </div>
                    <div
                      className="text-4xl font-heading font-black"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </div>
                    <div className="text-sm text-[#A7B0B7]">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Mini chart */}
                <div className="flex items-end gap-2 h-24">
                  {item.bars.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white/10 rounded-t-sm relative overflow-hidden"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="bar-fill absolute bottom-0 left-0 right-0 rounded-t-sm origin-bottom"
                        style={{
                          backgroundColor: item.color,
                          height: '100%',
                          opacity: 0.6 + (i * 0.1),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan/50 rounded-full px-8 group"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite Friends
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
