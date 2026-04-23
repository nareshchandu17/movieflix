"use client";

import { ChevronLeft, Users, Link2, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface WatchPartyHeaderProps {
  title: string;
  subtitle?: string;
  participantsCount: number;
  onLeave: () => void;
  onInvite: () => void;
  isHost: boolean;
  roomCode: string;
}

export const WatchPartyHeader = ({ 
  title, 
  subtitle = "Playing in HD", 
  participantsCount, 
  onLeave, 
  onInvite,
  isHost,
  roomCode
}: WatchPartyHeaderProps) => {
  return (
    <div className="w-full h-[72px] bg-black/40 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-8 z-[100]">
      {/* Title & Back */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">
            {title}
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center Badge & Avatars */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl py-1.5 pl-2 pr-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] bg-gradient-to-br from-gray-700 to-gray-900" />
            ))}
          </div>
          <div className="flex flex-col font-black uppercase text-[9px] leading-tight">
            <span className="text-white">Watch Party</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Sync
            </span>
          </div>
        </div>
        
        <button 
          onClick={onInvite}
          className="h-10 px-5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-xs text-white/80 active:scale-95 shadow-lg"
        >
          <Link2 size={16} />
          Invite
        </button>
        
        <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95">
          <Users size={18} />
        </button>
      </div>

      {/* Host Status Indicator */}
      <div className="flex items-center gap-3">
        {isHost && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Crown size={12} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Host Mode</span>
          </div>
        )}
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Room ID</span>
          <span className="text-xs font-black text-white/60 tracking-[0.2em]">{roomCode}</span>
        </div>
      </div>
    </div>
  );
};
