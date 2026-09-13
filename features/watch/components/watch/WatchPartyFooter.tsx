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
    <div className="w-full min-h-20 bg-[#0A0A0A] border-t border-white/5 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-10 py-4 md:py-0 gap-4 md:gap-0 z-[100] mt-auto">
      <div className="flex items-center gap-6 md:gap-12 flex-wrap justify-center">
        <div className="flex items-center gap-2.5">
          <Users size={16} className="text-zinc-500 shrink-0" />
          <span className="text-xs font-medium text-zinc-500">
            You're Watching Together <span className="text-white ml-1">{participantsCount}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Crown size={16} className="text-amber-500 shrink-0" />
          <span className="text-xs font-medium text-zinc-500">
            Started by <span className="text-white ml-1">{hostName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-zinc-500 shrink-0" />
          <span className="text-xs font-medium text-zinc-500">
            Started at <span className="text-white ml-1">{startTime}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button 
          onClick={onReport}
          className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <AlertTriangle size={16} />
          Report Issue
        </button>
        
        <button 
          onClick={onLeave}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-all active:scale-95 group"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          Leave Party
        </button>
      </div>
    </div>
  );
};
