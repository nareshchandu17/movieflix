"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: string;
  placeholderTitle?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  children,
  rootMargin = "350px",
  minHeight = "340px",
  placeholderTitle,
}) => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  if (inView) {
    return <div ref={containerRef} className="w-full transition-opacity duration-500">{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{ minHeight }}
      className="w-full py-6 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden select-none"
    >
      <div className="flex items-center gap-3 mb-6 animate-pulse">
        <div className="w-1.5 h-6 bg-red-600/60 rounded-full" />
        <div className="w-48 h-6 bg-white/5 rounded" />
        {placeholderTitle && (
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest ml-2">
            {placeholderTitle}
          </span>
        )}
      </div>
      <div className="flex gap-4 md:gap-5 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[160px] md:w-[200px] lg:w-[220px] aspect-[2/3] bg-white/5 border border-white/5 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default LazySection;
