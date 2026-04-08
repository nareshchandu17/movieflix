"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AVATARS, AVATAR_CATEGORIES } from "@/lib/avatars";
import type { Avatar } from "@/types/profiles";

interface AvatarCarouselProps {
  selected: string | null;
  onSelect: (avatarId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  character: "Characters",
  animal: "Animals",
  abstract: "Abstract",
};

export default function AvatarCarousel({ selected, onSelect }: AvatarCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  // Build flat list with category separators
  const items: Array<{ type: "label"; label: string } | { type: "avatar"; avatar: Avatar }> = [];
  for (const cat of AVATAR_CATEGORIES) {
    items.push({ type: "label", label: CATEGORY_LABELS[cat] });
    for (const avatar of AVATARS.filter((a) => a.category === cat)) {
      items.push({ type: "avatar", avatar });
    }
  }

  return (
    <div className="relative w-full group">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      {/* Scroll arrows */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-black/90 transition-colors cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-white hover:bg-black/90 transition-colors cursor-pointer backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-5 overflow-x-auto scrollbar-hide scroll-smooth px-16 py-6"
      >
        {items.map((item, i) => {
          if (item.type === "label") {
            return (
              <div
                key={`label-${item.label}`}
                className="flex-shrink-0 text-[10px] uppercase tracking-[2px] text-[#555] font-bold select-none pr-1"
              >
                {item.label}
              </div>
            );
          }

          const { avatar } = item;
          const isSelected = selected === avatar.id;

          return (
            <motion.button
              key={avatar.id}
              type="button"
              onClick={() => {
                onSelect(avatar.id);
                // Scroll selected into view
                const btn = document.getElementById(`avatar-${avatar.id}`);
                btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              id={`avatar-${avatar.id}`}
              whileHover={!isSelected ? { scale: 1.1 } : undefined}
              whileTap={{ scale: 0.95 }}
              className="relative flex-shrink-0 cursor-pointer focus:outline-none"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className={`
                  rounded-full bg-gradient-to-br ${avatar.gradient}
                  flex items-center justify-center
                  ${isSelected
                    ? "w-[120px] h-[120px] ring-4 ring-white ring-offset-2 ring-offset-black shadow-2xl"
                    : "w-[96px] h-[96px]"
                  }
                  transition-shadow duration-300
                `}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <span
                  className={`select-none ${isSelected ? "text-[52px]" : "text-[40px]"}`}
                  style={{ lineHeight: 1 }}
                >
                  {avatar.emoji}
                </span>
              </motion.div>

              {/* Checkmark badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="absolute -bottom-1 -right-1 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg"
                  >
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name label */}
              <p
                className={`mt-2 text-[11px] font-medium text-center truncate max-w-[96px] mx-auto ${
                  isSelected ? "text-white" : "text-[#666]"
                }`}
              >
                {avatar.name}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
