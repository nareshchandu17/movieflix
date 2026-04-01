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
        className={`relative max-w-2xl mx-auto rounded-2xl transition-all duration-500 ${
          isFocused
            ? "bg-white/10 border-red-500/40 shadow-lg shadow-red-500/10"
            : "bg-white/5 border-white/10"
        } border backdrop-blur-xl`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 px-5 py-3.5">
          <FiSearch
            className={`text-lg flex-shrink-0 transition-colors duration-300 ${
              isFocused ? "text-red-400" : "text-gray-500"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search scenes... try 'Salaar fight' or 'KGF entry'"
            className="flex-1 bg-transparent text-white text-sm md:text-base outline-none placeholder-gray-500"
          />
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleClear}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
            >
              <FiX size={14} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
