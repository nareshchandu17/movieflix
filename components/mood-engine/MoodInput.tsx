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
          className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60 tracking-tighter"
        >
          How's the <span className="text-purple-400">vibe?</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/40 font-medium tracking-wide uppercase text-[10px]"
        >
          Ai-Powered Cinematic Matching Engine
        </motion.p>
      </div>

      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-2xl blur-lg opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-3 flex items-center gap-4 transition-all group-hover:border-white/20">
          <Sparkles className="w-5 h-5 text-purple-400 ml-3" />
          <input
            type="text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMatch()}
            placeholder='e.g., "A dark slow-burn with a hopeful ending"'
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/10 py-3"
          />
          <button
            onClick={handleMatch}
            disabled={isProcessing || !moodText.trim()}
            className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-purple-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Engine <ChevronRight className="w-3 h-3" />
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
