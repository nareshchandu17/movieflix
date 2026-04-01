"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clip } from "@/lib/scenes/types";
import { useScenes } from "@/hooks/useScenes";
import ClipCard from "./ClipCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SceneCarouselProps {
  title: string;
  icon: string;
  query: string;
  onPlayClip: (clip: Clip) => void;
  index: number;
}

export default function SceneCarousel({ title, icon, query, onPlayClip, index }: SceneCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Lazy-load: only fetch data when carousel is visible
  const { clips, isLoading } = useScenes(isVisible ? query : null);

  // IntersectionObserver for viewport entry
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // GSAP scroll-trigger reveal
  useEffect(() => {
    if (!sectionRef.current || !isVisible) return;

    let ctx: gsap.Context | null = null;

    import("gsap").then(({ default: gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 90%",
                once: true,
              },
            }
          );
        }, sectionRef);
      });
    });

    return () => { ctx?.revert(); };
  }, [isVisible]);

  // Scroll tracking
  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 400);
  }, [updateScrollButtons]);

  // Skeleton loader
  const renderSkeletons = () => (
    <div className="flex gap-3 px-4 md:px-12">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-[300px] sm:w-[320px] h-[180px] rounded-xl flex-shrink-0 scene-skeleton"
        />
      ))}
    </div>
  );

  return (
    <motion.section
      ref={sectionRef}
      className="mb-8 md:mb-10 group/carousel opacity-0"
      style={{ opacity: isVisible ? undefined : 0 }}
    >
      {/* Title */}
      <div className="flex items-center gap-3 px-4 md:px-12 mb-3">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-2" />
        <span className="text-xs text-gray-500 font-mono">
          {clips.length > 0 ? `${clips.length} clips` : ""}
        </span>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-black/80 to-transparent
                       flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <FiChevronLeft className="text-white text-2xl" />
          </button>
        )}

        {/* Scrollable row */}
        {isLoading || !isVisible ? (
          renderSkeletons()
        ) : clips.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 snap-x snap-mandatory"
            onScroll={updateScrollButtons}
            style={{ scrollPaddingLeft: "3rem" }}
          >
            {clips.map((clip) => (
              <div key={clip.id} className="snap-start">
                <ClipCard clip={clip} onPlay={onPlayClip} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[180px] px-4 md:px-12">
            <p className="text-gray-600 text-sm">No clips available</p>
          </div>
        )}

        {/* Right arrow */}
        {canScrollRight && clips.length > 0 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-black/80 to-transparent
                       flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <FiChevronRight className="text-white text-2xl" />
          </button>
        )}
      </div>
    </motion.section>
  );
}
