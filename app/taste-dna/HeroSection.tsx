import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCcw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const microLabelRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Micro label entrance
      tl.fromTo(
        microLabelRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.2
      );

      // Headline entrance with split words effect
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 36, rotateX: 25 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.9 },
        0.3
      );

      // Subheadline entrance
      tl.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.5
      );

      // CTAs entrance
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.6
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set([helixRef.current, headlineRef.current, subheadlineRef.current, ctaRef.current, microLabelRef.current], {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            });
          },
        },
      });

      // EXIT animations (70% - 100%)
      scrollTl.fromTo(
        helixRef.current,
        { x: 0, opacity: 1, scale: 1 },
        { x: '-12vw', opacity: 0, scale: 0.92, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        subheadlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.74
      );

      scrollTl.fromTo(
        microLabelRef.current,
        { y: 0, opacity: 1 },
        { y: '-8vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, x: 0 },
        { scale: 1.06, x: '6vw', ease: 'power2.in' },
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
          backgroundImage: 'url(/hero_portrait.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient Overlay */}
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

        {/* Text Content */}
        <div className="ml-[6vw] lg:ml-[18vw] max-w-[46vw]">
          {/* Micro Label */}
          <div
            ref={microLabelRef}
            className="font-mono text-xs uppercase tracking-[0.14em] text-cyan mb-4"
          >
            Your Taste DNA
          </div>

          {/* Headline */}
          <div ref={headlineRef} className="mb-6">
            <h1 className="text-[clamp(36px,4.5vw,64px)] font-heading font-black uppercase leading-[0.95] text-[#F4F6FA]">
              Your Taste
              <br />
              Your DNA
            </h1>
          </div>

          {/* Subheadline */}
          <p
            ref={subheadlineRef}
            className="text-lg lg:text-xl text-[#A7B0B7] max-w-[38vw] mb-8 leading-relaxed"
          >
            A living profile built from what you watch—and how you feel.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Button
              size="default"
              className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-4 py-2 text-sm font-semibold group transition-transform hover:scale-105"
            >
              Explore Your Profile
              <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="default"
              className="bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-dark-200 hover:bg-red/90 rounded-full px-4 py-2 text-sm font-semibold group transition-transform hover:scale-105"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
