"use client";

import { motion } from "framer-motion";

interface KidsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function KidsToggle({ enabled, onChange }: KidsToggleProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <motion.span
          key={enabled ? "kids" : "normal"}
          initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="text-2xl select-none"
        >
          {enabled ? "🧸" : "🎬"}
        </motion.span>
        <div>
          <p className="text-sm font-semibold text-white">Kids Profile</p>
          <p className="text-xs text-[#8a8a8a]">Only show content rated for kids</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="relative w-[44px] h-[24px] rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
        style={{ backgroundColor: enabled ? "#E50914" : "#333" }}
      >
        <motion.div
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md"
          animate={{ left: enabled ? 23 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </button>
    </div>
  );
}
