"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoodInput from "@/components/mood-engine/MoodInput";
import MoodResults from "@/components/mood-engine/MoodResults";
import ClientLayout from "@/app/ClientLayout";

export default function MoodEnginePage() {
  const [results, setResults] = useState<any[] | null>(null);
  const [userMood, setUserMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <main className="relative z-10 pt-32 pb-20">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-7xl mx-auto px-8 space-y-12"
            >
               <div className="flex flex-col gap-4 mb-12">
                 <div className="h-12 w-64 bg-white/5 animate-pulse rounded-lg" />
                 <div className="h-4 w-48 bg-white/5 animate-pulse rounded-lg" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {[...Array(10)].map((_, i) => (
                   <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/5" />
                 ))}
               </div>
            </motion.div>
          ) : !results ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <MoodInput 
                onStartLoading={() => setIsLoading(true)}
                onMatch={(matches, mood) => {
                  setResults(matches);
                  if (mood) setUserMood(mood);
                  setIsLoading(false);
                }} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <MoodResults results={results} userMood={userMood} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Cinematic Overlays */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-soft-light opacity-[0.15] grayscale contrast-150">
        <div className="absolute inset-0 bg-[#050505] mix-blend-overlay" />
        <div className="absolute inset-0 bg-repeat bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="fixed inset-0 bg-gradient-to-b from-black/0 via-black/20 to-[#050505] pointer-events-none" />

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-10" />
    </div>
  );
}
