"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { useDebouncedCallback } from "use-debounce";

interface SceneSearchProps {
  onSearch: (query: string) => void;
}

export default function SceneSearch({ onSearch }: SceneSearchProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebouncedCallback((q: string) => {
    onSearch(q);
  }, 300);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      debouncedSearch(v.trim());
    },
    [debouncedSearch]
  );

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div className="px-4 md:px-12 py-6 md:py-8">
      <motion.div
        className={`relative max-w-2xl mx-auto rounded-full transition-all duration-500 overflow-hidden ${
          isFocused
            ? "bg-black/60 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
            : "bg-white/5 border-white/10 shadow-xl"
        } border backdrop-blur-2xl px-2`}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
      >
        <div className="flex items-center gap-3 px-6 py-4">
          <FiSearch
            className={`text-xl flex-shrink-0 transition-colors duration-300 ${
              isFocused ? "text-red-500" : "text-gray-400"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Example: "KGF entry", "Salaar fight"'
            className="flex-1 bg-transparent text-white text-base md:text-lg outline-none placeholder-gray-600 font-medium"
          />
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleClear}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <FiX size={16} />
            </motion.button>
          )}
        </div>
        {/* Glowing bottom line - focused only */}
        <motion.div 
          className="absolute bottom-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: isFocused ? 1 : 0, scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
}
