"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  Activity, 
  Users, 
  GitBranch, 
  Target, 
  Map as MapIcon,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  Info,
  Calendar,
  Clock,
  Zap,
  Bot
} from "lucide-react";
import { toast } from "sonner";

interface NarrativeNode {
  _id: string;
  startTime: number;
  endTime?: number;
  type: string;
  summary: string;
  plotImportance: number;
}

interface ArcPoint {
  _id: string;
  characterId: string;
  timestamp: number;
  type: string;
  description: string;
}

interface Character {
  _id: string;
  name: string;
  initialArchetype?: string;
  color?: string;
}

interface NarrativeMapProps {
  contentId: string;
  title: string;
  onClose: () => void;
}

const DetailedNarrativeMap = ({ contentId, title, onClose }: NarrativeMapProps) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Character colors based on index
  const getCharColor = (index: number) => {
    const colors = ["#E50914", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#22d3ee"];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/narrative/map?id=${contentId}`);
        const result = await res.json();
        if (result.success) {
          // Assign colors
          const charactersWithColors = result.data.characters.map((c: any, i: number) => ({
            ...c,
            color: getCharColor(i)
          }));
          setData({ ...result.data, characters: charactersWithColors });
        } else {
          toast.error("Failed to load narrative map");
        }
      } catch (err) {
        toast.error("Connection error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [contentId]);

  const timelineWidth = useMemo(() => {
    if (!data?.segments?.length) return 2000;
    const maxTime = Math.max(...data.segments.map((s: any) => s.endTime || s.startTime + 600));
    return Math.max(2000, maxTime * zoom * 0.5);
  }, [data, zoom]);

  const getTimeX = (time: number) => {
    if (!data?.segments?.length) return 0;
    const maxTime = Math.max(...data.segments.map((s: any) => s.endTime || s.startTime + 600));
    return (time / maxTime) * (timelineWidth - 400) + 200;
  };

  const getCharY = (charId: string) => {
    const index = data?.characters.findIndex((c: any) => c._id === charId);
    return 150 + (index * 80);
  };

  // Generate SVG paths for character threads
  const characterThreads = useMemo(() => {
    if (!data) return [];
    
    return data.characters.map((char: Character) => {
      const charPoints = data.arcPoints
        .filter((p: ArcPoint) => p.characterId === char._id)
        .sort((a: ArcPoint, b: ArcPoint) => a.timestamp - b.timestamp);

      if (charPoints.length < 2) return null;

      let pathData = `M ${getTimeX(charPoints[0].timestamp)} ${getCharY(char._id)}`;
      
      for (let i = 1; i < charPoints.length; i++) {
        const prev = charPoints[i-1];
        const curr = charPoints[i];
        const x1 = getTimeX(prev.timestamp);
        const y1 = getCharY(char._id);
        const x2 = getTimeX(curr.timestamp);
        const y2 = getCharY(char._id);
        
        // Add a slight curve
        pathData += ` C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`;
      }

      return {
        id: char._id,
        color: char.color,
        path: pathData,
        isDimmed: activeCharacter && activeCharacter !== char._id
      };
    }).filter(Boolean);
  }, [data, zoom, activeCharacter, timelineWidth]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl overflow-hidden flex flex-col"
    >
      {/* Cinematic Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/80 to-black" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapIcon className="w-5 h-5 text-blue-500" />
              <h1 className="text-2xl font-black font-['DM_Sans'] tracking-tight">NARRATIVE MAP</h1>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold"> Interactive Storyline Exploration • {title}</p>
          </div>

          <div className="h-10 w-[1px] bg-white/10 mx-2" />

          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomOut className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-[10px] font-black w-10 text-center text-gray-400">{Math.round(zoom * 100)}%</div>
            <button 
              onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <div className="flex -space-x-2">
              {data?.characters.map((char: any, i: number) => (
                <button
                  key={char._id}
                  onClick={() => setActiveCharacter(activeCharacter === char._id ? null : char._id)}
                  className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold transition-all ${
                    activeCharacter === char._id ? 'scale-125 z-10' : 'hover:scale-110 z-0'
                  }`}
                  style={{ backgroundColor: char.color }}
                  title={char.name}
                >
                  {char.name[0]}
                </button>
              ))}
            </div>
            {activeCharacter && (
              <button 
                onClick={() => setActiveCharacter(null)}
                className="text-[10px] font-bold text-blue-500 uppercase hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-full transition-all group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar" ref={containerRef}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-blue-500 animate-pulse">Syncing Narrative Chronology...</p>
            </div>
          </div>
        ) : (
          <div className="h-full relative py-20" style={{ width: timelineWidth }}>
            {/* SVG Layer for Threads */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: timelineWidth, height: '100%' }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {characterThreads.map((thread: any) => (
                <motion.path
                  key={thread.id}
                  d={thread.path}
                  stroke={thread.color}
                  strokeWidth={activeCharacter === thread.id ? 4 : 2}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: thread.isDimmed ? 0.1 : 0.6,
                    strokeWidth: activeCharacter === thread.id ? 4 : 2
                  }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  filter="url(#glow)"
                  className="transition-all duration-500"
                />
              ))}
            </svg>

            {/* General Plot Segments Layer (Top) */}
            <div className="absolute top-0 w-full flex items-center">
              {data.segments.map((segment: any, i: number) => (
                <motion.div
                  key={segment._id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute"
                  style={{ left: getTimeX(segment.startTime) }}
                >
                  <div 
                    onMouseEnter={() => setHoveredNode({ ...segment, type: 'segment' })}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`p-4 rounded-2xl border transition-all cursor-crosshair group ${
                      segment.type === 'plot-critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'
                    } ${hoveredNode?._id === segment._id ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.1)] z-50' : ''}`}
                    style={{ width: Math.max(200, (segment.endTime - segment.startTime) * zoom * 0.2) }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">
                        {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')}
                      </span>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                        segment.type === 'plot-critical' ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'
                      }`}>
                        {segment.type}
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-gray-200 line-clamp-2 leading-snug">
                      {segment.summary}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Character Arc Points (On Threads) */}
            {data.arcPoints.map((point: any, i: number) => {
              const char = data.characters.find((c: any) => c._id === point.characterId);
              const isDimmed = activeCharacter && activeCharacter !== point.characterId;
              
              return (
                <motion.div
                  key={point._id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: isDimmed ? 0.2 : 1 
                  }}
                  transition={{ delay: 1 + i * 0.05 }}
                  className="absolute z-10"
                  style={{ 
                    left: getTimeX(point.timestamp), 
                    top: getCharY(point.characterId) - 10,
                  }}
                >
                  <div 
                    onMouseEnter={() => setHoveredNode({ ...point, type: 'arc', charColor: char?.color })}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="group relative cursor-pointer"
                  >
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-black shadow-lg transition-transform group-hover:scale-150"
                      style={{ backgroundColor: char?.color }}
                    />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/90 border border-white/20 p-2 rounded-lg backdrop-blur-md">
                        <div className="text-[9px] font-black uppercase text-gray-500 mb-1">{char?.name} • {point.type}</div>
                        <p className="text-[10px] font-bold text-white">{point.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Timeline Axis Labels */}
            <div className="absolute bottom-0 w-full h-px bg-white/10 flex items-end">
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute h-8 border-l border-white/20"
                  style={{ left: (i * timelineWidth / 14) }}
                >
                  <span className="text-[10px] font-black text-gray-600 absolute -top-10 -translate-x-1/2">
                    PT {i * 10}M
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Panel / Tooltip (Sidebar-style on Hover) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-10 top-32 w-80 bg-gray-950/90 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Bot className="w-24 h-24" />
            </div>

            <div className={`p-4 rounded-2xl mb-6 flex items-center justify-center`} style={{ backgroundColor: hoveredNode.charColor ? `${hoveredNode.charColor}20` : '#ffffff05' }}>
              {hoveredNode.type === 'segment' ? (
                <Target className="w-8 h-8 text-blue-500" />
              ) : (
                <Activity className="w-8 h-8" style={{ color: hoveredNode.charColor }} />
              )}
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                  {hoveredNode.type === 'segment' ? 'Story Point' : 'Character Arc'}
                </span>
                <span className="text-[10px] font-bold text-blue-400">
                  Timestamp: {Math.floor(hoveredNode.startTime || hoveredNode.timestamp) / 60}m
                </span>
              </div>

              <h3 className="text-xl font-black text-white leading-tight">
                {hoveredNode.summary || hoveredNode.description}
              </h3>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    "This moment creates a ripple effect in Season 2, fundamentally shifting {hoveredNode.charName || 'the narrative'} trajectory."
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${hoveredNode.plotImportance > 7 ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <span className="text-[10px] font-black uppercase text-gray-500">
                    Priority: {hoveredNode.plotImportance || 'Impact'}
                  </span>
                </div>
                <button className="text-[10px] font-black text-blue-500 flex items-center gap-1 hover:text-white transition-colors">
                  CATCH UP <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Legend */}
      <div className="relative z-10 px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Plot Critical</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Exposition/Beat</span>
          </div>
          <div className="flex items-center gap-3">
            <GitBranch className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Character Arc</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300">NARRATIVE ENGINE: ACTIVE</span>
          </div>
          <p className="text-[10px] font-bold text-gray-600">© 2026 MOVIEFLIX AI LABS • v1.4.2-NEXUS</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailedNarrativeMap;
