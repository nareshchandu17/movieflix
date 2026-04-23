"use client";

import { Users, Crown, Clock, AlertTriangle, LogOut } from "lucide-react";

interface WatchPartyFooterProps {
  participantsCount: number;
  hostName: string;
  startTime: string;
  onLeave: () => void;
  onReport: () => void;
}

export const WatchPartyFooter = ({ 
  participantsCount, 
  hostName, 
  startTime, 
  onLeave, 
  onReport 
}: WatchPartyFooterProps) => {
  return (
    <div className="w-full h-16 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-between px-8 z-[100] mt-auto">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-500">
            <Users size={16} />
          </div>
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            You're Watching Together <span className="text-white ml-1">{participantsCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500">
            <Crown size={16} />
          </div>
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            Started by <span className="text-white ml-1">{hostName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
            <Clock size={16} />
          </div>
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            Started at <span className="text-white ml-1">{startTime}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onReport}
          className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors"
        >
          <AlertTriangle size={14} />
          Report Issue
        </button>
        
        <button 
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg group"
        >
          <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
          Leave Party
        </button>
      </div>
    </div>
  );
};
