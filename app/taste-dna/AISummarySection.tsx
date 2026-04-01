import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface AISummarySectionProps {
  className?: string;
}

export default function AISummarySection({ className = '' }: AISummarySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);

  const summaryText = `You chase cerebral tension—stories that build atmosphere into explosive payoff. You favor morally complex leads, slow-burn structure, and soundtracks that feel like characters.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      scrollTl.fromTo(
        helixRef.current,
        { x: '-12vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        headlineRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        cardRef.current,
        { y: '18vh', opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        textRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.12
      );

      scrollTl.fromTo(
        ladderRef.current,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, ease: 'none' },
        0.1
      );

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        helixRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-8vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        cardRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        ladderRef.current,
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
      className={`relative w-full h-screen overflow-hidden ${className}`}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/summary_bg.jpg)',
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
        <div className="ml-[6vw] lg:ml-[18vw] max-w-[50vw] lg:max-w-[44vw]">
          {/* Headline */}
          <div ref={headlineRef} className="mb-6">
            <h2 className="text-[clamp(34px,4.2vw,64px)] font-heading font-black uppercase leading-[1.0] text-[#F4F6FA]">
              AI Summary
            </h2>
          </div>

          {/* Summary Card */}
          <div
            ref={cardRef}
            className="dna-card relative mb-6"
          >
            {/* Top border accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan via-violet to-transparent" />
            
            {/* Glow shadow */}
            <div 
              className="absolute inset-0 rounded-[28px] opacity-30"
              style={{ boxShadow: '0 0 40px rgba(41, 215, 255, 0.2)' }}
            />

            <div ref={textRef} className="relative">
              <p className="text-lg lg:text-xl text-[#F4F6FA] leading-relaxed">
                {summaryText}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-6 font-semibold group"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Preferences
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-6 font-semibold group"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-lime" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Summary'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right-side DNA ladder line */}
        <div
          ref={ladderRef}
          className="absolute right-[12vw] top-[22vh] h-[56vh] hidden lg:flex flex-col items-center"
          style={{ transformOrigin: 'top' }}
        >
          {/* Vertical line */}
          <div 
            className="w-[2px] h-full rounded-full"
            style={{ 
              background: 'linear-gradient(180deg, #29D7FF 0%, transparent 100%)',
              boxShadow: '0 0 20px rgba(41, 215, 255, 0.5)'
            }}
          />
          
          {/* Rungs */}
          <div className="absolute inset-0 flex flex-col justify-around items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-[2px] rounded-full bg-cyan/60"
                style={{ boxShadow: '0 0 8px rgba(41, 215, 255, 0.4)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
