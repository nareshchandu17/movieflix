"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Sliders, Play, Heart, ChevronRight } from "lucide-react";

export default function MoodInput({ onMatch }: { onMatch: (results: any[]) => void }) {
  const [moodText, setMoodText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [intensity, setIntensity] = useState(5);

  const handleMatch = async () => {
    if (!moodText.trim()) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/mood-engine/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: moodText,
          intensity: showSliders ? intensity : undefined
        }),
      });
      const data = await response.json();
      if (data.success) {
        onMatch(data.recommendations);
      }
    } catch (error) {
      console.error("Match failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-8">
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40"
        >
          How are you feeling?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/50"
        >
          Describe your emotional journey, we'll find the perfect cinematic match.
        </motion.p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <Sparkles className="w-6 h-6 text-purple-400 ml-2" />
          <input
            type="text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMatch()}
            placeholder='e.g., "I want to cry but feel hope at the end" or "Cozy but not boring"'
            className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-white/20 py-4"
          />
          <button
            onClick={handleMatch}
            disabled={isProcessing || !moodText.trim()}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Engine <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setShowSliders(!showSliders)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
            showSliders ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/5 text-white/40 hover:text-white/60"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Fine-tune intensity
        </button>
      </div>

      <AnimatePresence>
        {showSliders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm text-white/40">
                <span>Low Intensity</span>
                <span>High Intensity</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-white" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
