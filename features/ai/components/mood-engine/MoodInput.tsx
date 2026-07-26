"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Sliders, Play, Heart, ChevronRight } from "lucide-react";

export default function MoodInput({ 
  onMatch,
  onStartLoading
}: { 
  onMatch: (results: unknown[], mood?: string) => void,
  onStartLoading: () => void
}) {
  const [moodText, setMoodText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [intensity, setIntensity] = useState(5);

  const MOODS = [
    { 
      id: "thrilling", 
      label: "Thrilling", 
      emoji: "⚡", 
      desc: "Edge-of-your-seat suspense",
      color: "from-amber-600/20 to-orange-600/20",
      borderColor: "group-hover:border-amber-500/50"
    },
    { 
      id: "feel-good", 
      label: "Feel-Good", 
      emoji: "😊", 
      desc: "Laughter, family & joy",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "group-hover:border-blue-500/50"
    },
    { 
      id: "romantic", 
      label: "Romantic", 
      emoji: "❤️", 
      desc: "Love, passion & drama",
      color: "from-rose-600/20 to-pink-600/20",
      borderColor: "group-hover:border-rose-500/50"
    },
    { 
      id: "emotional", 
      label: "Emotional", 
      emoji: "😢", 
      desc: "Deeply moving stories",
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "group-hover:border-indigo-500/50"
    },
    { 
      id: "action-packed", 
      label: "Action-Packed", 
      emoji: "🔥", 
      desc: "Explosive blockbusters",
      color: "from-red-600/20 to-orange-600/20",
      borderColor: "group-hover:border-red-500/50"
    },
    { 
      id: "comedy", 
      label: "Comedy", 
      emoji: "😂", 
      desc: "Pure laughs & fun",
      color: "from-yellow-600/20 to-lime-600/20",
      borderColor: "group-hover:border-yellow-500/50"
    },
    { 
      id: "horror", 
      label: "Horror", 
      emoji: "😱", 
      desc: "Terrifying encounters",
      color: "from-zinc-900/40 to-red-900/40",
      borderColor: "group-hover:border-red-600/70"
    },
    { 
      id: "adventure", 
      label: "Adventure", 
      emoji: "🌄", 
      desc: "Epic journeys & fantasy",
      color: "from-emerald-600/20 to-teal-600/20",
      borderColor: "group-hover:border-emerald-500/50"
    },
    { 
      id: "sci-fi", 
      label: "Sci-Fi", 
      emoji: "🚀", 
      desc: "Futuristic space odysseys",
      color: "from-violet-600/20 to-blue-600/20",
      borderColor: "group-hover:border-violet-500/50"
    },
    { 
      id: "inspirational", 
      label: "Inspirational", 
      emoji: "✨", 
      desc: "Heartwarming true stories",
      color: "from-sky-600/20 to-indigo-600/20",
      borderColor: "group-hover:border-sky-500/50"
    },
    { 
      id: "mystery", 
      label: "Mystery", 
      emoji: "🔍", 
      desc: "Suspenseful puzzles",
      color: "from-slate-600/20 to-zinc-600/20",
      borderColor: "group-hover:border-slate-500/50"
    },
    { 
      id: "family", 
      label: "Family", 
      emoji: "👨‍👩‍👧‍👦", 
      desc: "Wholesome entertainment",
      color: "from-orange-600/20 to-yellow-600/20",
      borderColor: "group-hover:border-orange-500/50"
    }
  ];

  const handleMoodSelect = async (moodId: string) => {
    setIsProcessing(true);
    onStartLoading();
    try {
      const response = await fetch(`/api/ai/mood?mood=${moodId}`);
      const data = await response.json();
      if (data.movies) {
        onMatch(data.movies, data.mood);
      }
    } catch (error) {
      console.error("Mood selection failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMatch = async () => {
    if (!moodText.trim()) return;
    
    // Phase 3: Comprehensive 12-mood keyword mapping
    let targetMood = "";
    const lowerText = moodText.toLowerCase();
    
    if (lowerText.includes("thrill") || lowerText.includes("suspense")) {
      targetMood = "thrilling";
    } else if (lowerText.includes("happy") || lowerText.includes("feel good") || lowerText.includes("joy")) {
      targetMood = "feel-good";
    } else if (lowerText.includes("love") || lowerText.includes("romance") || lowerText.includes("passion")) {
      targetMood = "romantic";
    } else if (lowerText.includes("sad") || lowerText.includes("cry") || lowerText.includes("moving")) {
      targetMood = "emotional";
    } else if (lowerText.includes("action") || lowerText.includes("explosion") || lowerText.includes("fast")) {
      targetMood = "action-packed";
    } else if (lowerText.includes("comedy") || lowerText.includes("funny") || lowerText.includes("laugh")) {
      targetMood = "comedy";
    } else if (lowerText.includes("horror") || lowerText.includes("scary") || lowerText.includes("fear")) {
      targetMood = "horror";
    } else if (lowerText.includes("adventure") || lowerText.includes("journey") || lowerText.includes("fantasy")) {
      targetMood = "adventure";
    } else if (lowerText.includes("sci-fi") || lowerText.includes("space") || lowerText.includes("future")) {
      targetMood = "sci-fi";
    } else if (lowerText.includes("inspire") || lowerText.includes("motivation") || lowerText.includes("biography")) {
      targetMood = "inspirational";
    } else if (lowerText.includes("mystery") || lowerText.includes("puzzle") || lowerText.includes("detective")) {
      targetMood = "mystery";
    } else if (lowerText.includes("family") || lowerText.includes("kids") || lowerText.includes("animation")) {
      targetMood = "family";
    }

    if (targetMood) {
      await handleMoodSelect(targetMood);
    } else {
      await handleMoodSelect("thrilling");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 p-8">
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60 tracking-tighter"
        >
          How are you <span className="text-red-500">feeling?</span>
        </motion.h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {MOODS.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => !isProcessing && handleMoodSelect(m.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:p-6 transition-all hover:bg-white/[0.05] ${m.borderColor} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              <span className="text-3xl md:text-4xl">{m.emoji}</span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors">{m.label}</h3>
                <p className="text-[10px] md:text-xs text-white/40 font-medium line-clamp-1">{m.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative flex items-center gap-4 max-w-md mx-auto">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Or describe it</span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-white/0 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-3 flex items-center gap-4 transition-all group-hover:border-white/10">
          <Sparkles className="w-5 h-5 text-white/20 ml-3" />
          <input
            type="text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMatch()}
            placeholder='e.g., "Something dark and thrilling"'
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/10 py-3"
            disabled={isProcessing}
            suppressHydrationWarning
          />
          <button
            onClick={handleMatch}
            disabled={isProcessing || !moodText.trim()}
            className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            suppressHydrationWarning
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                Analyze <ChevronRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
