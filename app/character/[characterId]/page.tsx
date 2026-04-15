"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Zap, Info, Share2, Download, Maximize2, Compass } from "lucide-react";
import ArcChart from "@/components/character-compass/ArcChart";
import CharacterDNACard from "@/components/character-compass/CharacterDNACard";
import RelationshipWeb from "@/components/character-compass/RelationshipWeb";

export default function CharacterCompassPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params?.characterId as string;
  
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/character-compass/${characterId}`);
        const result = await response.json();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch character compass:", error);
        setError("Network error: Could not reach character engine.");
      } finally {
        setIsLoading(false);
      }
    }
    if (characterId) fetchData();
  }, [characterId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Calibrating Compass...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.visualization?.arcPoints) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-12 max-w-lg w-full text-center space-y-6 backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System Malfunction</h2>
            <p className="text-white/40 font-medium">{error || "The character data has not been initialized or is incomplete."}</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all uppercase tracking-widest text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const arcPoints = data.visualization.arcPoints;
  const currentPoint = activePoint !== null ? arcPoints[activePoint] : arcPoints[arcPoints.length - 1];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-display overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 px-8 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Compass className="w-8 h-8 text-blue-500" /> {data.character.name}
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Character Compass • {data.character.actorName}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all flex items-center gap-2">
            Comparison Mode <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 p-8 grid grid-cols-12 gap-8">
        {/* Left Column - Arc & Detail */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Main Visualizer */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Narrative Arc
              </h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                Time Axis: {Math.floor(currentPoint.timestamp / 60)}m {currentPoint.timestamp % 60}s
              </div>
            </div>
            <ArcChart 
              points={data.visualization.arcPoints} 
              inflections={data.visualization.inflectionMarkers}
              activePoint={activePoint || undefined}
              onPointHover={setActivePoint}
            />
          </div>

          {/* Real-time State Analysis */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Moral Alignment", value: currentPoint.y, color: "text-blue-400" },
              { label: "Emotional State", value: currentPoint.emotion, color: "text-purple-400" },
              { label: "Stability Score", value: `${currentPoint.stability}/10`, color: "text-pink-400" },
              { label: "Power Level", value: `${currentPoint.power}/10`, color: "text-yellow-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 block">
                  {stat.label}
                </span>
                <p className={`text-lg font-bold capitalize ${stat.color}`}>
                  {typeof stat.value === 'number' && stat.value > 0 ? `+${stat.value}` : stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Timeline of Inflection Points */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Info className="w-4 h-4" /> Key Inflection Points
            </h3>
            <div className="space-y-8">
              {data.visualization.inflectionMarkers.map((inf: any, i: number) => (
                <div key={i} className="flex gap-6 relative group">
                  {i < data.visualization.inflectionMarkers.length - 1 && (
                    <div className="absolute left-6 top-8 bottom-[-32px] w-px bg-white/5 group-hover:bg-blue-500/20 transition-colors" />
                  )}
                  <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 font-bold group-hover:bg-blue-500/10 transition-all">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-500">{inf.type}</span>
                      <span className="text-[10px] text-white/20 font-bold">EVENT-{Math.floor(Math.random() * 1000)}</span>
                    </div>
                    <p className="text-white/80 font-medium leading-relaxed">{inf.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - DNA & Relationships */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <CharacterDNACard 
            name={data.character.name}
            dna={data.analysis.dna}
            summary={data.analysis.summary}
            tags={data.analysis.evolutionTags}
            archetypes={{ 
              initial: data.character.initialArchetype, 
              final: data.character.finalArchetype 
            }}
          />
          
          <RelationshipWeb 
            mainCharacter={data.character.name}
            relationships={data.relationships}
          />

          <button className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-3xl border border-white/10 font-bold flex items-center justify-center gap-3 transition-all group">
            <Download className="w-5 h-5 text-white/40 group-hover:text-white" /> Export Character Report
          </button>
        </div>
      </main>
    </div>
  );
}
