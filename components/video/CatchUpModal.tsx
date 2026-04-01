"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Clock, Users, ScrollText, PlayCircle } from "lucide-react";

interface CatchUpModalProps {
  contentId: string;
  contentType: "Movie" | "Series";
  skippedFrom: number;
  skippedTo: number;
  onClose: () => void;
}

export default function CatchUpModal({ contentId, contentType, skippedFrom, skippedTo, onClose }: CatchUpModalProps) {
  const [data, setData] = useState<any>(null);
  const [format, setFormat] = useState<'short' | 'medium' | 'long'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch("/api/catch-up/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contentId, 
            contentType, 
            skippedFrom: { timestamp: skippedFrom }, 
            skippedTo: { timestamp: skippedTo } 
          }),
        });
        const result = await response.json();
        if (result.success) setData(result);
      } catch (error) {
        console.error("Failed to fetch catch-up:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex h-[600px]">
          {/* Sidebar - Timeline */}
          <div className="w-1/3 border-r border-white/5 bg-black/40 p-8 space-y-8 hidden md:block">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline
            </h3>
            <div className="space-y-6">
              {data?.timeline?.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                  {i < data.timeline.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-white/5" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 ring-4 ring-blue-500/20 z-10" />
                  <div>
                    <span className="text-xs text-white/30 font-mono">
                      {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')}
                    </span>
                    <p className="text-sm font-medium text-white/80">{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold">Narrative Catch-up</h2>
                <p className="text-white/40">Bridging the gap safely</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
              {/* Summary Selector */}
              <div className="flex p-1 bg-white/5 rounded-xl w-fit">
                {['short', 'medium', 'long'].map((f: any) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                      format === f ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Summary Text */}
              <div className="relative group">
                <p className="text-xl leading-relaxed text-white/90 font-serif italic">
                  "{data?.formats[format]}"
                </p>
                <button className="absolute -right-2 bottom-0 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-500 transition-colors">
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Character States */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Current State
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {data?.characterSnapshot?.map((char: any, i: number) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-xs text-white/40 block mb-1">{char.name}</span>
                      <p className="font-bold text-sm mb-1">{char.emotionalState}</p>
                      <span className="text-[10px] text-blue-400 uppercase font-bold">{char.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
              >
                Resume Watching <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
