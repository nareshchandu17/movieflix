"use client";

import React, { useEffect, useState } from "react";
import { Brain, Eye, Zap, Globe, Stars, Bot, Sparkles, ChevronDown, Info, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIInsightsQuery } from "../queries/seriesQueries";

interface AIInsightsSidebarProps {
  seriesId: number;
  seriesTitle: string;
  onShowMap: () => void;
}

export const AIInsightsSidebar = ({ seriesId, seriesTitle, onShowMap }: AIInsightsSidebarProps) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const { data: insightsData, isLoading, error } = useAIInsightsQuery(seriesId, seriesTitle);
  const [dynamicInsights, setDynamicInsights] = useState<any[]>([]);

  useEffect(() => {
    if (insightsData) {
      const icons = [
        <Brain key="brain" className="w-4 h-4" />,
        <Eye key="eye" className="w-4 h-4" />,
        <Zap key="zap" className="w-4 h-4" />,
        <Globe key="globe" className="w-4 h-4" />,
        <Stars key="stars" className="w-4 h-4" />
      ];

      const mappedInsights = insightsData.map((insight: any, index: number) => ({
        ...insight,
        id: index,
        icon: icons[index % icons.length]
      }));

      setDynamicInsights(mappedInsights);
    }
  }, [insightsData]);

  if (error) {
    return (
      <div className="rounded-[2.5rem] bg-black/40 border border-white/10 p-8 text-center backdrop-blur-3xl">
        <Bot className="w-10 h-10 text-red-500/50 mx-auto mb-4 animate-pulse" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 space-y-6"
    >
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 p-1">
        {/* Google AI Studio Border Glow Effect */}
        <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#3b82f6_180deg,transparent_210deg,transparent_360deg)]" />
          <div className="absolute inset-[-100%] animate-[spin_11s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#8b5cf6_180deg,transparent_210deg,transparent_360deg)]" />
        </div>

        <div className="relative rounded-[2.2rem] bg-gray-950/90 p-8 h-full backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Insights</h2>
              <p className="text-[10px] uppercase tracking-widest text-blue-400/70 font-bold">Powered by Gemini Engine</p>
            </div>
          </div>

          <div className="mb-8 p-5 rounded-3xl bg-white/5 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="text-yellow-500 animate-pulse">⭐</div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">AI HIGHLIGHT</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded-full animate-pulse" />
                    <div className="h-2 w-2/3 bg-white/10 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    "{dynamicInsights[0]?.content.split('.')[0]}."
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-[1.5rem] border border-white/5 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              ))
            ) : dynamicInsights.map((item) => (
              <div key={item.id} className="group/item border border-white/5 rounded-[1.5rem] overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 shadow-xl">
                <button
                  onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-4 px-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all duration-500 ${openSection === item.id ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${openSection === item.id ? 'text-white' : 'text-gray-400'}`}>
                      {item.title}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${openSection === item.id ? 'rotate-180 text-blue-500' : 'text-gray-600'}`} />
                </button>

                <AnimatePresence>
                  {openSection === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="h-[1px] w-full bg-white/5 mb-4 shadow-sm" />
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{item.header}</h4>
                          <p className="text-xs text-gray-300 leading-relaxed font-bold">
                            {item.content}
                          </p>
                          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                            <div className="flex items-start gap-2">
                              <Info className="w-3 h-3 text-blue-500 mt-0.5" />
                              <p className="text-[10px] text-blue-400 leading-normal italic font-medium">
                                {item.benefit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <button
            onClick={onShowMap}
            className="w-full mt-8 flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group/btn shadow-lg"
          >
            <span className="text-xs font-bold text-gray-400 group-hover:text-white">Detailed Narrative Map</span>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

