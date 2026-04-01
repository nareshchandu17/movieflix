"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, SlidersHorizontal } from 'lucide-react';
import type { FilterChip } from './types';
import { filterChips } from './data/movies';

export function FilterChips() {
  const [chips, setChips] = useState<FilterChip[]>(filterChips);

  const toggleChip = (id: string) => {
    setChips((prev) =>
      prev.map((chip) =>
        chip.id === id ? { ...chip, active: !chip.active } : chip
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 px-6 lg:px-10 py-4 overflow-x-auto hide-scrollbar"
    >
      {chips.map((chip, index) => (
        <motion.button
          key={chip.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.4 + index * 0.06,
            ease: [0.68, -0.55, 0.265, 1.55],
          }}
          onClick={() => toggleChip(chip.id)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative flex items-center gap-2 px-5 py-2.5 rounded-full
            text-sm font-medium whitespace-nowrap
            transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${
              chip.active
                ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                : 'glass-light text-white/80 hover:text-white hover:bg-white/10'
            }
          `}
        >
          {chip.icon && (
            <span className="flex items-center justify-center">{chip.icon}</span>
          )}
          <span>{chip.label}</span>
          
          {/* Ripple effect on active */}
          {chip.active && (
            <motion.span
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-white/20"
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
