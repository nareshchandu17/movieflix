"use client";

import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";

interface KidsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function KidsToggle({ enabled, onChange }: KidsToggleProps) {
  return (
    <div className="flex items-center justify-between w-full p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${enabled ? "bg-red-600/20 text-red-500" : "bg-white/10 text-white/40"}`}>
          <Clapperboard className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-white tracking-wide">Kids Profile</p>
          <p className="text-[11px] text-[#777] font-medium">Only show content rated for kids</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="relative w-[48px] h-[26px] rounded-full cursor-pointer transition-colors duration-300 focus:outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-red-500/50"
        style={{ backgroundColor: enabled ? "#E50914" : "#333" }}
      >
        <motion.div
          className="absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-lg"
          animate={{ left: enabled ? 25 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
