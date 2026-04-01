"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, X, Brain, Zap } from 'lucide-react';
import type { AISuggestion } from './types';

interface AISuggestionPanelProps {
  suggestion: AISuggestion;
}

export function AISuggestionPanel({ suggestion }: AISuggestionPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;
    
    const text = suggestion.explanation;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [isVisible, suggestion.explanation]);

  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsVisible(true)}
        className="fixed right-6 top-28 z-40 w-12 h-12 rounded-full bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/40 ai-glow"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-6 top-28 z-40 w-[320px]"
    >
      <div className="glass rounded-2xl overflow-hidden ai-glow">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-[#E50914]" />
            </motion.div>
            <span className="text-sm font-semibold text-white">AI Suggestion</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Mood Detection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full">
              <Brain className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="text-xs text-white/60">Detected Mood:</span>
            </div>
            <div className="flex gap-1.5">
              {suggestion.moods.map((mood, i) => (
                <motion.span
                  key={mood.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="px-2 py-1 bg-[#E50914]/20 rounded-full text-xs font-medium text-[#E50914]"
                >
                  {mood.emoji} {mood.label}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 0.5 }}
            className="h-px bg-white/10"
          />

          {/* Explanation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-white/80 leading-relaxed min-h-[40px]"
          >
            {typedText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-[#E50914] ml-0.5 align-middle"
            />
          </motion.p>

          {/* Movie Preview */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={suggestion.movie.poster}
                    alt={suggestion.movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-sm font-semibold text-white">{suggestion.movie.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                      <span>⭐ {suggestion.movie.rating}</span>
                      <span>•</span>
                      <span>{suggestion.movie.genres?.join(' • ')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E50914] rounded-lg text-sm font-semibold text-white hover:bg-[#B20710] transition-colors shadow-lg shadow-[#E50914]/30"
            >
              <Play className="w-4 h-4 fill-white" />
              Play Now
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2.5 bg-white/5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Zap className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#E50914]/10 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
