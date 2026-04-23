"use client";

import { Shield, Play, Globe, Monitor, ChevronDown, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface WatchPartyDashboardProps {
  isHost: boolean;
  isPlaying: boolean;
  latency: number;
  quality: string;
}

export const WatchPartyDashboard = ({ isHost, isPlaying, latency, quality }: WatchPartyDashboardProps) => {
  const cards = [
    {
      id: 'host',
      title: 'Host Controls',
      subtitle: isHost ? 'You are the host' : 'Naresh is hosting',
      icon: <Shield className="text-red-500" size={24} />,
      action: isHost ? 'Manage' : null,
      bg: 'bg-red-500/5',
      border: 'border-red-500/10'
    },
    {
      id: 'playback',
      title: 'Playback',
      subtitle: isHost ? 'Controlling playback' : 'Host is controlling playback',
      icon: <Play className="text-violet-500" size={24} />,
      locked: !isHost,
      bg: 'bg-violet-500/5',
      border: 'border-violet-500/10'
    },
    {
      id: 'sync',
      title: 'Sync Status',
      subtitle: latency < 150 ? 'All good! Everyone is in sync.' : 'Minor latency detected',
      icon: <Globe className={latency < 150 ? "text-emerald-500" : "text-amber-500"} size={24} />,
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10'
    },
    {
      id: 'quality',
      title: 'Quality',
      subtitle: `${quality} - HD`,
      icon: <Monitor className="text-blue-500" size={24} />,
      hasDropdown: true,
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 px-8 mt-6">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`relative p-5 rounded-[24px] ${card.bg} border ${card.border} flex flex-col gap-4 group cursor-pointer transition-all shadow-xl`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${card.id === 'playback' && card.locked ? 'opacity-50' : ''}`}>
              {card.icon}
            </div>
            {card.action && (
              <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all">
                {card.action}
              </button>
            )}
            {card.locked && (
              <Lock size={14} className="text-white/20" />
            )}
            {card.hasDropdown && (
              <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors" />
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-tight">
              {card.title}
            </h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 line-clamp-1">
              {card.subtitle}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
