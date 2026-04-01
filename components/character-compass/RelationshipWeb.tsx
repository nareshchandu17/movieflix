"use client";

import { motion } from "framer-motion";
import { Users, Link2 } from "lucide-react";

interface Relationship {
  id: string;
  name: string;
  latestState: {
    type: string;
    quality: number;
    description: string;
  };
}

interface RelationshipWebProps {
  mainCharacter: string;
  relationships: Relationship[];
}

export default function RelationshipWeb({ mainCharacter, relationships }: RelationshipWebProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full space-y-8 relative overflow-hidden">
      <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
        <Users className="w-4 h-4" /> Relationship Web
      </h3>

      <div className="relative h-[250px] flex items-center justify-center">
        {/* Central Character */}
        <div className="relative z-10 size-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <div className="size-full bg-black rounded-full flex items-center justify-center font-bold text-xl text-white">
            {mainCharacter[0]}
          </div>
        </div>

        {/* Radial Connections */}
        {relationships.map((rel, i) => {
          const angle = (i * (360 / relationships.length)) * (Math.PI / 180);
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={rel.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute flex flex-col items-center gap-2"
              style={{ x, y }}
            >
              <div className="size-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold group cursor-help">
                {rel.name[0]}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-32 bg-black border border-white/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  <p className="text-[10px] font-bold text-blue-400 capitalize">{rel.latestState?.type || 'Unknown'}</p>
                  <p className="text-[9px] text-white/40 leading-tight mt-1">{rel.latestState?.description || 'No data'}</p>
                </div>
              </div>
              <span className="text-[9px] uppercase font-black text-white/40 text-center w-16 truncate">
                {rel.name}
              </span>
            </motion.div>
          );
        })}

        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {relationships.map((rel, i) => {
            const angle = (i * (360 / relationships.length)) * (Math.PI / 180);
            const radius = 90;
            const x2 = 125 + Math.cos(angle) * radius;
            const y2 = 125 + Math.sin(angle) * radius;
            
            return (
              <line 
                key={i}
                x1="125" y1="125" x2={x2} y2={y2} 
                stroke="url(#lineGrad)" 
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        {relationships.slice(0, 2).map((rel, i) => (
          <div key={i} className="flex justify-between items-center text-[10px]">
            <span className="text-white/40 font-bold uppercase">{rel.name}</span>
            <div className={`px-2 py-0.5 rounded-full font-black ${
              (rel.latestState?.quality || 0) > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
            }`}>
              {rel.latestState?.quality || 0 > 0 ? 'POSITIVE' : 'NEGATIVE'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
