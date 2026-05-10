"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

import SceneSearch from "./SceneSearch";

interface Particle {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  color: string;
  opacity: number;
}

interface SceneHeroProps {
  onSearch: (query: string) => void;
}

export default function SceneHero({ onSearch }: SceneHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  // ... (keep useEffect for particles generation as is - skipping for brevity in thought, but must include in actual tool call)
  useEffect(() => {
    setIsClient(true);
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308"];
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    if (!isClient || particles.length === 0) return;
    
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out", delay: 0.3 }
      );

      // Subtitle reveal
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 }
      );

      // Search bar reveal
      gsap.fromTo(
        searchRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.9 }
      );

      // Floating particles
      if (particlesRef.current) {
        const particleElements = particlesRef.current.children;
        Array.from(particleElements).forEach((particle, i) => {
          gsap.to(particle, {
            y: `random(-80, 80)`,
            x: `random(-40, 40)`,
            opacity: `random(0.2, 0.8)`,
            duration: `random(3, 6)`,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        });
      }

      // Parallax scroll-out
      if (typeof window !== "undefined") {
        import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          gsap.registerPlugin(ScrollTrigger);
          gsap.to(heroRef.current, {
            y: -100,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isClient, particles]);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 scene-hero-gradient" />

      {/* Film grain overlay */}
      <div className="absolute inset-0 scene-grain-overlay opacity-40" />

      {/* Floating particles */}
      {isClient && (
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: `radial-gradient(circle, ${particle.color}, transparent)`,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 w-full max-w-5xl">
        {/* Clapperboard Icon */}
        <motion.div
          initial={{ scale: 0, scaleZ: 0 }}
          animate={{ scale: 1, scaleZ: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="inline-block mb-2 relative"
        >
          <div className="absolute inset-0 blur-2xl bg-red-500/30 rounded-full scale-150" />
          <span className="text-5xl md:text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            🎬
          </span>
        </motion.div>

        <h1
          ref={titleRef}
          className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter opacity-0 mt-2"
          style={{
            background: "linear-gradient(to right, #ff4c4c, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 30px rgba(239, 68, 68, 0.4))",
          }}
        >
          SCENES
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto opacity-0 font-medium tracking-wide drop-shadow-md"
        >
          Discover the most iconic, spine-tingling, and unforgettable in cinema history
        </p>

        {/* Integrated Search Bar */}
        <div ref={searchRef} className="mt-10 opacity-0 w-full max-w-2xl mx-auto">
          <SceneSearch onSearch={onSearch} />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#000000] to-transparent" />
    </section>
  );
}
