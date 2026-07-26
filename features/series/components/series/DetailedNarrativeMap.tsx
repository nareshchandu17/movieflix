"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Map as MapIcon, 
  GitBranch, 
  Zap, 
  Target, 
  MessageSquare, 
  ChevronRight, 
  Sparkles,
  Brain,
  History,
  TrendingUp,
  Info
} from "lucide-react";

interface NarrativeNode {
  id: string;
  type: 'plot' | 'character' | 'mystery' | 'climax';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  season: number;
  episode: number;
}

interface DetailedNarrativeMapProps {
  contentId: string;
  title: string;
  onClose: () => void;
}

const DetailedNarrativeMap = ({ contentId, title, onClose }: DetailedNarrativeMapProps) => {
  const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null);
  const [nodes, setNodes] = useState<NarrativeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Narrative Data (In a real app, this would fetch from an AI-generated endpoint)
  useEffect(() => {
    const timer = setTimeout(() => {
      setNodes([
        {
          id: "1",
          type: "plot",
          title: "The Initial Incitement",
          description: "The event that sets the series in motion, establishing the primary conflict and the protagonist's motivation.",
          impact: "medium",
          season: 1,
          episode: 1
        },
        {
          id: "2",
          type: "character",
          title: "The Mentor's Secret",
          description: "A pivotal revelation about the mentor figure that changes the protagonist's perspective on their journey.",
          impact: "high",
          season: 1,
          episode: 4
        },
        {
          id: "3",
          type: "mystery",
          title: "The Unseen Connection",
          description: "A subtle clue is introduced that links seemingly disparate plotlines, hinting at a larger conspiracy.",
          impact: "medium",
          season: 1,
          episode: 6
        },
        {
          id: "4",
          type: "plot",
          title: "The Mid-Season Pivot",
          description: "A sudden turn in events that shifts the focus of the narrative and raises the stakes significantly.",
          impact: "high",
          season: 1,
          episode: 8
        },
        {
          id: "5",
          type: "climax",
          title: "Season One Resolution",
          description: "The convergence of major plotlines and the ultimate confrontation that closes the first chapter.",
          impact: "high",
          season: 1,
          episode: 10
        }
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [contentId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-gray-950/50 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                Narrative DNA Map
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{title}</p>
                <div className="h-1 w-8 bg-blue-500/50 rounded-full" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Generated Analysis</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 rounded-full transition-all group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map Visualization (Left) */}
          <div className="flex-1 relative p-12 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Mapping Narrative Architecture...</p>
              </div>
            ) : (
              <div className="space-y-12 max-w-3xl mx-auto relative">
                {/* Connecting Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-gradient-to-b from-blue-600/40 via-purple-600/40 to-blue-600/40 rounded-full" />

                {nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex gap-10 group cursor-pointer`}
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Node Indicator */}
                    <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                      selectedNode?.id === node.id 
                        ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110' 
                        : 'bg-gray-900 border-white/10 group-hover:border-blue-500/50'
                    }`}>
                      {node.type === 'plot' && <GitBranch className={`w-6 h-6 ${selectedNode?.id === node.id ? 'text-white' : 'text-blue-400'}`} />}
                      {node.type === 'character' && <Target className={`w-6 h-6 ${selectedNode?.id === node.id ? 'text-white' : 'text-purple-400'}`} />}
                      {node.type === 'mystery' && <Zap className={`w-6 h-6 ${selectedNode?.id === node.id ? 'text-white' : 'text-amber-400'}`} />}
                      {node.type === 'climax' && <Sparkles className={`w-6 h-6 ${selectedNode?.id === node.id ? 'text-white' : 'text-red-400'}`} />}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest">
                          S{node.season} E{node.episode}
                        </span>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md ${
                          node.impact === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {node.impact} Impact
                        </span>
                      </div>
                      <h3 className={`text-xl font-black transition-colors ${selectedNode?.id === node.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {node.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-2 group-hover:text-gray-400 transition-colors">
                        {node.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel (Right) */}
          <div className="w-full lg:w-[400px] bg-black/40 border-l border-white/5 p-12 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Selected Event</span>
                      <div className="h-[1px] flex-1 bg-blue-500/20" />
                    </div>
                    <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                      {selectedNode.title}
                    </h3>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Narrative Context</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                      "{selectedNode.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Timeline Pos</span>
                      <p className="text-lg font-black text-white uppercase">S{selectedNode.season} • E{selectedNode.episode}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Criticality</span>
                      <p className={`text-lg font-black uppercase ${selectedNode.impact === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                        {selectedNode.impact}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Engagement Dynamics</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Tension Build', value: selectedNode.impact === 'high' ? 95 : 65, color: 'bg-red-500' },
                        { label: 'Plot Density', value: selectedNode.type === 'plot' ? 90 : 70, color: 'bg-blue-500' },
                        { label: 'Character Depth', value: selectedNode.type === 'character' ? 92 : 60, color: 'bg-purple-500' }
                      ].map(stat => (
                        <div key={stat.label} className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                            <span className="text-gray-400">{stat.label}</span>
                            <span className="text-white">{stat.value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.value}%` }}
                              className={`h-full ${stat.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 border-dashed">
                    <MapIcon className="w-16 h-16 text-gray-800" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Select a Node</h3>
                    <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">To see detailed narrative analysis</p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            <div className="mt-auto pt-8">
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95">
                Full Narrative Summary
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DetailedNarrativeMap;
