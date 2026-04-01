"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

interface Particle {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  color: string;
  opacity: number;
}

export default function SceneHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Generate particles only on client side to avoid hydration mismatch
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
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "power4.out", delay: 0.3 }
      );

      // Subtitle reveal
      gsap.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 }
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
            y: -150,
            opacity: 0,
            scale: 0.95,
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
      className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 scene-hero-gradient" />

      {/* Film grain overlay */}
      <div className="absolute inset-0 scene-grain-overlay opacity-30" />

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

      {/* Cinematic light beams */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-red-500/20 via-transparent to-transparent rotate-12" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-orange-500/15 via-transparent to-transparent -rotate-6" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="inline-block mb-6"
        >
          <span className="text-5xl">🎬</span>
        </motion.div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight opacity-0"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #ef4444 40%, #f97316 70%, #eab308 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            filter: "drop-shadow(0 0 40px rgba(239, 68, 68, 0.3))",
          }}
        >
          SCENES
        </h1>

        <p
          ref={subtitleRef}
          className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto opacity-0 font-light tracking-wide"
        >
          Discover the most iconic, spine-tingling, and unforgettable moments in cinema history
        </p>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 mx-auto flex items-start justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
