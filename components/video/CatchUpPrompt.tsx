"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Info, Zap, ChevronRight, PlayCircle } from "lucide-react";

interface CatchUpPromptProps {
  contentId: string;
  contentType: "Movie" | "Series";
  skippedFrom: number;
  skippedTo: number;
  onShowSummary: () => void;
}

export default function CatchUpPrompt({ 
  contentId, 
  contentType, 
  skippedFrom, 
  skippedTo, 
  onShowSummary 
}: CatchUpPromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt if the skip is significant (> 5 minutes or 300 seconds)
    if (skippedTo - skippedFrom > 300) {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Delay for cinematic entry
      return () => clearTimeout(timer);
    }
  }, [skippedFrom, skippedTo]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 right-8 z-[60] max-w-sm"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl flex flex-col gap-4 shadow-2xl">
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">Missed something?</h4>
                  <p className="text-sm text-white/50 leading-relaxed">
                    You skipped about {Math.round((skippedTo - skippedFrom) / 60)} minutes. Want a spoiler-free catch up?
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onShowSummary}
                  className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
                >
                  Catch Me Up <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
