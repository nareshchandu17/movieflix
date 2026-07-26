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
    <div className="relative w-full max-w-[400px] group">
      {/* Floating label */}
      <motion.label
        htmlFor={inputId}
        className="absolute left-4 pointer-events-none origin-top-left text-[#555] z-10"
        initial={false}
        animate={{
          y: isFloating ? 8 : 16,
          scale: isFloating ? 0.75 : 1,
          color: isFocused ? "#E50914" : isFloating ? "#777" : "#555",
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
          w-full h-[56px] bg-[#0d0d0d] rounded-lg px-4 pt-6 pb-2
          text-[16px] font-medium text-white
          border transition-all duration-300
          focus:outline-none
          ${error 
            ? "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]" 
            : isFocused 
              ? "border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.1)]" 
              : "border-white/5 hover:border-white/10"
          }
        `}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Character counter (Fixed position matching mockup) */}
      <div className="absolute right-3 bottom-1.5 flex items-center h-4">
        <span className={`text-[10px] font-medium transition-colors duration-300 ${isFocused ? "text-[#E50914]" : "text-[#444]"}`}>
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-red-500 text-[11px] font-medium mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
