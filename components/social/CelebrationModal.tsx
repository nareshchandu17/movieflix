"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Share2, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface CelebrationModalProps {
  show: boolean;
  milestone: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  onClose: () => void;
}

export default function CelebrationModal({ show, milestone, onClose }: CelebrationModalProps) {
  useEffect(() => {
    if (show) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-3xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative w-full max-w-2xl aspect-video rounded-[4rem] bg-gradient-to-br from-zinc-900 to-black border border-white/20 p-12 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)]"
          >
            {/* Background Glow */}
            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[80%] aspect-square bg-primary/20 blur-[120px] rounded-full -z-10" />

            <button 
              onClick={onClose}
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div 
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="size-32 rounded-full bg-white text-black flex items-center justify-center mb-8 shadow-2xl"
            >
              {milestone.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight italic italic">
                {milestone.title} Unlocked!
              </h2>
              <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed">
                {milestone.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-6 mt-12"
            >
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
              >
                Dismiss
              </button>
              <button className="px-10 py-4 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share Glory
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
