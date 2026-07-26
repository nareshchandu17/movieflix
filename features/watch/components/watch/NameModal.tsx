"use client";

import { useState } from "react";
import { User, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NameModalProps {
  onSubmit: (name: string) => void;
  movieData?: {
    movieTitle: string;
    moviePoster: string;
  };
}

export const NameModal = ({ onSubmit, movieData }: NameModalProps) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(name.trim());
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#050505]/90 backdrop-blur-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Banner if movie data exists */}
        {movieData && (
          <div className="h-48 relative overflow-hidden">
            <img 
              src={movieData.moviePoster} 
              alt={movieData.movieTitle}
              className="w-full h-full object-cover grayscale opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111]/80 to-transparent" />
            <div className="absolute bottom-6 left-8 flex flex-col">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Sparkles size={12} /> Joining Party
              </span>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                {movieData.movieTitle}
              </h1>
            </div>
          </div>
        )}

        <div className="p-10 pt-6">
          <div className="flex flex-col mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Identify Yourself</h2>
            <p className="text-white/40 text-sm font-medium">How should your friends see you in the party?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors">
                <User size={20} />
              </div>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter display name..."
                className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 text-lg font-bold text-white placeholder:text-white/10 focus:bg-white/[0.05] focus:border-white/10 focus:ring-0 transition-all"
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="group relative w-full h-16 bg-red-600 hover:bg-red-500 disabled:opacity-20 text-white rounded-2xl font-black uppercase tracking-[0.1em] overflow-hidden transition-all shadow-[0_8px_24px_-8px_rgba(220,38,38,0.5)] active:scale-[0.98]"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <span>Enter Party Room</span>
                    <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
              Secured Session • 128-bit Encryption
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
