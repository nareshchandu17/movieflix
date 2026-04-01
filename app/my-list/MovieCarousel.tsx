"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import type { Movie } from './types';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  variant?: 'default' | 'expiring';
  delay?: number;
}

export function MovieCarousel({ title, movies, variant = 'default', delay = 0 }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 600;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollability, 300);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 lg:px-10 mb-4">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={`text-xl lg:text-2xl font-bold ${
            variant === 'expiring' ? 'text-[#E50914]' : 'text-white'
          }`}
        >
          {title}
          {variant === 'expiring' && (
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              ⚠️
            </motion.span>
          )}
        </motion.h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              p-2 rounded-full transition-all duration-200
              ${canScrollLeft
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              p-2 rounded-full transition-all duration-200
              ${canScrollRight
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
              }
            `}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Fade */}
        <div
          className={`
            absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none
            bg-gradient-to-r from-[#0F0F0F] to-transparent
            transition-opacity duration-300
            ${canScrollLeft ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Right Fade */}
        <div
          className={`
            absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none
            bg-gradient-to-l from-[#0F0F0F] to-transparent
            transition-opacity duration-300
            ${canScrollRight ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          className="flex gap-4 px-6 lg:px-10 overflow-x-auto scroll-smooth"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
