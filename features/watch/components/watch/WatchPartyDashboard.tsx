"use client";

import React from "react";

import { Shield, Play, Pause, Globe, Monitor, ChevronDown, Lock, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface WatchPartyDashboardProps {
  isHost: boolean;
  isPlaying: boolean;
  latency: number;
  quality: string;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  movieTitle?: string;
}

export const WatchPartyDashboard = React.memo(({ 
  isHost, 
  isPlaying, 
  latency, 
  quality,
  onPlay,
  onPause,
  onSeek,
  movieTitle
}: WatchPartyDashboardProps) => {
  const cards = [
    {
      id: 'host',
      title: 'Host Controls',
      subtitle: isHost ? 'You are the host' : 'Naresh is hosting',
      icon: <Shield className="text-red-500" size={20} />,
      action: isHost ? 'Manage' : null,
      bg: 'bg-red-500/5',
      border: 'border-red-500/10'
    },
    {
      id: 'playback',
      title: 'Playback',
      subtitle: isHost ? 'Host is controlling playback' : 'Host is controlling playback',
      icon: <Play className="text-violet-500" size={20} />,
      locked: true,
      bg: 'bg-violet-500/5',
      border: 'border-violet-500/10'
    },
    {
      id: 'sync',
      title: 'Sync Status',
      subtitle: 'All good! Everyone is in sync.',
      icon: <Zap className="text-emerald-500" size={20} fill="currentColor" />,
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10'
    },
    {
      id: 'quality',
      title: 'Quality',
      subtitle: `1080p - HD`,
      icon: <Activity className="text-blue-500" size={20} />,
      hasDropdown: true,
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 px-8 mt-4 mb-4">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          whileHover={{ y: -2, scale: 1.01 }}
          onClick={() => {
            if (card.id === 'playback' && isHost) {
              isPlaying ? onPause?.() : onPlay?.();
            }
          }}
          className={`relative p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-4 group cursor-pointer transition-all shadow-xl ${
            card.id === 'playback' && isHost ? 'hover:border-violet-500/30' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
            {card.icon}
          </div>
          
          <div className="flex flex-col min-w-0">
            <h3 className="text-xs font-bold text-white tracking-tight truncate">
              {card.title}
            </h3>
            <p className="text-[10px] font-medium text-zinc-500 mt-0.5 line-clamp-1">
              {card.subtitle}
            </p>
          </div>

          <div className="ml-auto">
            {card.id === 'playback' && isHost && (
               <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                  {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
               </div>
            )}
            {card.action && (
              <button className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest transition-all">
                {card.action}
              </button>
            )}
            {card.locked && !isHost && (
              <Lock size={12} className="text-zinc-600" />
            )}
            {card.hasDropdown && (
              <ChevronDown size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

WatchPartyDashboard.displayName = "WatchPartyDashboard";
