"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  maxLength?: number;
}

export default function ProfileNameInput({
  value,
  onChange,
  error,
  maxLength = 20,
}: ProfileNameInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();
  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Floating label */}
      <motion.label
        htmlFor={inputId}
        className="absolute left-3 pointer-events-none origin-top-left text-[#555] z-10"
        animate={{
          y: isFloating ? -8 : 14,
          scale: isFloating ? 0.75 : 1,
          color: isFloating ? "#8a8a8a" : "#555",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        Profile Name
      </motion.label>

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full h-[52px] bg-[#1a1a1a] rounded-lg px-3 pt-4 pb-1
          text-[15px] font-normal text-white
          border transition-colors duration-200
          focus:outline-none
          ${error ? "border-[#E50914]" : isFocused ? "border-white/50" : "border-[#333]"}
        `}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[2px] bg-[#E50914] rounded-full"
        initial={{ width: 0, x: 0 }}
        animate={{
          width: isFocused ? "100%" : "0%",
          x: isFocused ? "-50%" : "0%",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Character counter */}
      <AnimatePresence>
        {isFocused && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-3 -bottom-5 text-[11px] text-[#555]"
          >
            {value.length}/{maxLength}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-[#E50914] text-xs mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
