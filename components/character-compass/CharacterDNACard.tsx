"use client";

import { motion } from "framer-motion";
import { Award, Zap, Shield, Target } from "lucide-react";

interface DNACardProps {
  name: string;
  dna: string;
  summary: string;
  tags: string[];
  archetypes: { initial: string; final: string };
}

export default function CharacterDNACard({ name, dna, summary, tags, archetypes }: DNACardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full flex flex-col gap-8 relative overflow-hidden group">
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
      
      <div className="space-y-2 relative">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
          <Award className="w-4 h-4" /> Character DNA
        </h3>
        <p className="text-2xl font-serif italic text-white/90 leading-tight">
          "{dna}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/30 uppercase font-black mb-1 block">Origin</span>
          <p className="font-bold text-sm text-blue-400">{archetypes.initial}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/30 uppercase font-black mb-1 block">Destiny</span>
          <p className="font-bold text-sm text-purple-400">{archetypes.final}</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Narrative Path</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[11px] font-bold text-white/60 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-white/50 leading-relaxed pt-2">
          {summary}
        </p>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
        <span>ID: {name.slice(0, 3).toUpperCase()}-992</span>
        <span>Status: ARCHESTEP_COMPLETE</span>
      </div>
    </div>
  );
}
