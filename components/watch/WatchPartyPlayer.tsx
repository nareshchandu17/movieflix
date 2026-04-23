"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2, MessageCircle, Heart, Laugh, ThumbsUp, Send, Users, X, Info, AlertCircle, Clock, Link2, CheckCircle, Plus, Crown } from 'lucide-react';
import Image from 'next/image';

interface WatchPartyPlayerProps {
  watchParty: {
    _id: string;
    movieId: string;
    movieTitle: string;
    moviePoster: string;
    roomCode: string;
    circleId: string;
    hostId: string;
    participants: Array<{
      userId: string;
      userName: string;
      userImage: string;
    }>;
  } | null;
  userId: string;
  userName: string;
  userImage: string;
  onLeave: () => void;
  socketState: any;
  playbackState: any;
  play: (t: number) => void;
  pause: (t: number) => void;
  seek: (t: number) => void;
  sendMessage: (m: string) => void;
  sendReaction: (r: string) => void;
  setStatus: (s: string) => void;
}

// Physics-based floating reaction component
const ReactionPhysics = ({ reaction, onComplete }: { reaction: any, onComplete: (id: string) => void }) => {
  const [randomX] = useState(Math.random() * 80 - 40);
  const [randomDuration] = useState(2.5 + Math.random() * 1.5);
  
  return (
    <motion.div
      initial={{ y: 0, x: '50%', opacity: 0, scale: 0.5 }}
      animate={{ 
        y: -400 - Math.random() * 200, 
        x: `calc(50% + ${randomX}px)`, 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        rotate: randomX / 2
      }}
      transition={{ duration: randomDuration, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(reaction.id)}
      className="absolute bottom-10 left-0 right-0 pointer-events-none flex justify-center z-50"
    >
      <div className="flex flex-col items-center">
        <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {reaction.type === 'love' && '❤️'}
          {reaction.type === 'laugh' && '😂'}
          {reaction.type === 'like' && '👍'}
          {reaction.type === 'surprised' && '😲'}
          {reaction.type === 'sad' && '😢'}
          {reaction.type === 'angry' && '😠'}
        </span>
      </div>
    </motion.div>
  );
};

export const WatchPartyPlayer = ({ 
  watchParty, 
  userId, 
  userName, 
  userImage, 
  onLeave,
  socketState,
  playbackState,
  play,
  pause,
  seek,
  sendMessage,
  sendReaction,
  setStatus
}: WatchPartyPlayerProps) => {
  const [showChat, setShowChat] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [reactionPool, setReactionPool] = useState<any[]>([]);
  const [currentVolume, setCurrentVolume] = useState(1);
  const uiTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide UI logic
  const resetUITimer = useCallback(() => {
    setShowUI(true);
    if (uiTimeout.current) clearTimeout(uiTimeout.current);
    uiTimeout.current = setTimeout(() => {
      if (!showChat) setShowUI(false);
    }, 4000);
  }, [showChat]);

  useEffect(() => {
    const handleMouseMove = () => resetUITimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [resetUITimer]);

  if (!watchParty) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4 text-white/40">
        <div className="w-12 h-12 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest">Initializing Cinematic Stream...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black group/player cursor-none overflow-hidden">
      <style jsx global>{`
        .cursor-none { cursor: none !important; }
        .group/player:hover { cursor: default !important; }
      `}</style>

      {/* Video Content Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image 
          src={watchParty.moviePoster} 
          alt={watchParty.movieTitle}
          fill
          className="object-cover opacity-20 blur-sm"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center animate-pulse mb-6">
            <Play size={40} className="text-red-500 ml-1" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{watchParty.movieTitle}</h2>
          <p className="text-white/40 mt-2 font-bold uppercase tracking-widest text-xs">Ready for Synchronized Playback</p>
        </div>
      </div>

      {/* Reactions Overlay */}
      <AnimatePresence>
        {playbackState.reactions?.map((r: any) => (
          <ReactionPhysics key={r.id} reaction={r} onComplete={() => {}} />
        ))}
      </AnimatePresence>

      {/* Top Bar Controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-40"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={onLeave}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all text-white"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">{watchParty.movieTitle}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    {socketState.participants.slice(0, 3).map((p: any) => (
                      <div key={p.socketId} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[8px] font-bold uppercase">
                        {(p.userName || 'G').substring(0, 1)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">
                    {socketState.participants.length} Watching
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
                <Info size={14} className="text-white/40" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Details</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Bottom Controls */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent z-40"
          >
            {/* Progress Bar */}
            <div className="group/progress relative h-1.5 w-full bg-white/10 rounded-full mb-8 cursor-pointer overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-red-600 transition-all" 
                style={{ width: `${(playbackState.currentTime / 3600) * 100}%` }} 
              />
              <div className="absolute inset-0 opacity-0 group-hover/progress:opacity-100 transition-opacity flex items-center">
                <div className="h-4 w-4 bg-white rounded-full shadow-xl border-4 border-red-600" style={{ marginLeft: `calc(${(playbackState.currentTime / 3600) * 100}% - 8px)` }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => playbackState.currentPlayState === 'playing' ? pause(playbackState.currentTime) : play(playbackState.currentTime)}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                >
                  {playbackState.currentPlayState === 'playing' ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 group/volume relative">
                    <Volume2 size={20} className="text-white/60 hover:text-white cursor-pointer" />
                    <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-2/3" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white/40 font-mono">
                    {Math.floor(playbackState.currentTime / 60)}:{(playbackState.currentTime % 60).toString().padStart(2, '0')} / 124:00
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                  <button onClick={() => sendReaction('love')} className="p-2 hover:bg-white/10 rounded-xl transition-all text-2xl hover:scale-125">❤️</button>
                  <button onClick={() => sendReaction('laugh')} className="p-2 hover:bg-white/10 rounded-xl transition-all text-2xl hover:scale-125">😂</button>
                  <button onClick={() => sendReaction('thumbsup')} className="p-2 hover:bg-white/10 rounded-xl transition-all text-2xl hover:scale-125">👍</button>
                </div>
                
                <button className="p-2 text-white/60 hover:text-white transition-colors">
                  <Maximize2 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
