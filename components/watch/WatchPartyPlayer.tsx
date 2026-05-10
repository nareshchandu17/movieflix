"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2, X, Link as LinkIcon, Info, Users, Heart, Smile, Zap, Layers, Monitor, Subtitles, Settings, PictureInPicture2 } from 'lucide-react';
import Image from 'next/image';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface WatchPartyPlayerProps {
  watchParty: {
    _id: string;
    movieId: string;
    movieTitle: string;
    moviePoster: string;
    videoUrl?: string;
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
  reactions: any[]; // New prop
  play: (t: number) => void;
  pause: (t: number) => void;
  seek: (t: number) => void;
  updateProgress: (t: number) => void; // New prop
  sendMessage: (m: string) => void;
  sendReaction: (r: string, name: string, time: number) => void;
  setStatus: (s: string) => void;
}

const ReactionPhysics = ({ reaction, onComplete }: { reaction: any, onComplete: (id: string) => void }) => {
  const [randomX] = useState(Math.random() * 100 - 50);
  const [randomDuration] = useState(3 + Math.random() * 2);
  
  return (
    <motion.div
      initial={{ y: 0, x: '50%', opacity: 0, scale: 0.5 }}
      animate={{ 
        y: -500 - Math.random() * 200, 
        x: `calc(50% + ${randomX}px)`, 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.5, 1, 0.8],
        rotate: randomX / 2
      }}
      transition={{ duration: randomDuration, ease: "easeOut" }}
      onAnimationComplete={() => onComplete(reaction.id)}
      className="absolute bottom-20 left-0 right-0 pointer-events-none flex justify-center z-50"
    >
      <div className="flex flex-col items-center">
        <span className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
          {reaction.type === 'love' && '❤️'}
          {reaction.type === 'laugh' && '😂'}
          {reaction.type === 'wow' && '😲'}
          {reaction.type === 'fire' && '🔥'}
          {reaction.type === 'clap' && '👏'}
        </span>
      </div>
    </motion.div>
  );
};

export const WatchPartyPlayer = ({ 
  watchParty, 
  userId, 
  userName, 
  onLeave,
  socketState,
  playbackState,
  reactions,
  play,
  pause,
  seek,
  updateProgress,
  sendMessage,
  sendReaction,
  setStatus
}: WatchPartyPlayerProps) => {
  const [showUI, setShowUI] = useState(true);
  const [currentVolume, setCurrentVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [localReactions, setLocalReactions] = useState<any[]>([]);
  const uiTimeout = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const TRAILER_URL = "https://www.youtube.com/watch?v=4uP2U_O6z5Q";

  // 1. Local time updates
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    const interval = setInterval(() => {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
      setDuration(playerRef.current.getDuration());
      
      // If host and playing, broadcast progress
      if (socketState.isHost && playbackState.isPlaying) {
        updateProgress(time);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isReady, socketState.isHost, playbackState.isPlaying, updateProgress]);

  // 2. Playback Sync Logic (Crucial for 100% functionality)
  useEffect(() => {
    if (!playerRef.current || !isReady || socketState.isHost) return;

    // If local time is more than 2 seconds away from socket time, sync it
    const localTime = playerRef.current.getCurrentTime();
    const serverTime = playbackState.currentTime;

    if (Math.abs(localTime - serverTime) > 2) {
      playerRef.current.seekTo(serverTime, 'seconds');
    }
  }, [playbackState.currentTime, isReady, socketState.isHost]);

  const resetUITimer = useCallback(() => {
    setShowUI(true);
    if (uiTimeout.current) clearTimeout(uiTimeout.current);
    uiTimeout.current = setTimeout(() => {
      setShowUI(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => resetUITimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [resetUITimer]);

  // 3. Reaction handling
  useEffect(() => {
    if (reactions?.length > 0) {
      const newReaction = reactions[reactions.length - 1];
      setLocalReactions(prev => [...prev, newReaction]);
    }
  }, [reactions]);

  const removeReaction = (id: string) => {
    setLocalReactions(prev => prev.filter(r => r.id !== id));
  };

  const handleTogglePlay = () => {
    if (!socketState.isHost) return; // Only host can toggle for everyone
    const t = playerRef.current?.getCurrentTime() || 0;
    playbackState.isPlaying ? pause(t) : play(t);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!socketState.isHost) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const targetTime = percentage * duration;
    
    // Seek locally for immediate feedback
    playerRef.current?.seekTo(targetTime, 'seconds');
    
    // Broadcast to others
    seek(targetTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-black group/player overflow-hidden selection:bg-none" onMouseMove={resetUITimer}>
      <div className="absolute inset-0 z-0 scale-[1.01]">
        <ReactPlayer
          ref={playerRef}
          url={watchParty?.videoUrl || TRAILER_URL}
          width="100%"
          height="100%"
          playing={playbackState.isPlaying}
          volume={currentVolume}
          muted={isMuted}
          onReady={() => setIsReady(true)}
          onBuffer={() => setStatus('buffering')}
          onBufferEnd={() => setStatus('watching')}
          config={{
            youtube: { playerVars: { controls: 0, modestbranding: 1, rel: 0, disablekb: 1 } }
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {localReactions.map((r: any) => (
            <ReactionPhysics key={r.id} reaction={r} onComplete={removeReaction} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 p-10 flex flex-col pointer-events-none"
          >
            <div className="flex justify-between items-start pointer-events-none">
               <div className="flex flex-col gap-3 pointer-events-auto">
                  <div className="flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                     <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/5">
                        <Users size={14} className="text-red-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Room Code:</span>
                        <span className="text-xs font-black text-white">{watchParty?.roomCode || '0000'}</span>
                        <button className="ml-1 text-zinc-500 hover:text-white transition-colors">
                           <Layers size={14} />
                        </button>
                     </div>
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(window.location.href);
                         alert('Link Copied!');
                       }}
                       className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                     >
                        <LinkIcon size={14} />
                        Copy Link
                     </button>
                  </div>
               </div>

               <div className="bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/20 rounded-[24px] p-4 flex items-center gap-4 pointer-events-auto">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                     <Zap size={20} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-white leading-tight">Everyone is in sync</span>
                     <span className="text-[10px] font-medium text-zinc-500 mt-0.5">Latency: 120ms</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex items-center pointer-events-none mt-20">
               <motion.div 
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="w-72 bg-black/60 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 flex flex-col gap-4 pointer-events-auto shadow-2xl"
               >
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Up Next</span>
                  <div className="flex gap-4">
                     <div className="w-20 h-24 rounded-2xl overflow-hidden relative border border-white/10">
                        <Image 
                           src={watchParty?.moviePoster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0"}
                           alt="Next"
                           fill
                           className="object-cover"
                        />
                     </div>
                     <div className="flex flex-col justify-center gap-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">S1 E3</span>
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">The Hidden Truth</h4>
                        <span className="text-[10px] font-medium text-zinc-600 mt-1">23:45</span>
                     </div>
                  </div>
               </motion.div>
            </div>

            <div className="mt-auto flex flex-col gap-8 pointer-events-none items-center">
               <div className="w-full flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px] pointer-events-auto">
                     {['❤️', '😂', '😲', '🔥', '👏'].map((emoji, i) => (
                        <button 
                           key={i}
                           onClick={() => sendReaction(['love', 'laugh', 'wow', 'fire', 'clap'][i], userName, currentTime)}
                           className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-xl hover:scale-125 transition-all"
                        >
                           {emoji}
                        </button>
                     ))}
                     <div className="w-px h-6 bg-white/10 mx-1" />
                     <button className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                        <Smile size={20} />
                     </button>
                  </div>

                  <div className="flex items-center gap-4 pointer-events-auto">
                     <div className="flex -space-x-4">
                        {socketState.participants.slice(0, 4).map((p: any, i: number) => (
                           <div key={i} className="flex flex-col items-center gap-2 group/avatar relative">
                              <div className={`w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-800 relative overflow-hidden ring-2 ${p.isHost ? 'ring-amber-500/50' : 'ring-emerald-500/50'}`}>
                                 <Image 
                                    src={`https://i.pravatar.cc/100?u=${p.userId}`}
                                    alt={p.userName}
                                    fill
                                    className="object-cover"
                                 />
                                 <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${p.status === 'watching' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              </div>
                              <div className="flex flex-col items-center absolute -top-10 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                 <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-tighter whitespace-nowrap">
                                    {p.userName}
                                 </span>
                                 {p.isHost && <span className="text-[7px] font-black text-amber-500 uppercase">HOST</span>}
                              </div>
                           </div>
                        ))}
                        {socketState.participants.length > 4 && (
                           <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-900 flex items-center justify-center text-xs font-black text-white ring-2 ring-white/10">
                                 +{socketState.participants.length - 4}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="w-20" />
               </div>

               <div className="w-full bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-6 flex flex-col gap-6 pointer-events-auto shadow-2xl">
                  <div 
                    className="group/progress relative h-1.5 w-full bg-white/5 rounded-full cursor-pointer"
                    onClick={handleSeek}
                  >
                     <div 
                       className="absolute h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300"
                       style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                     />
                     <div 
                       className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-red-600 shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity"
                       style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)` }}
                     />
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                           <button 
                             onClick={handleTogglePlay}
                             className="w-10 h-10 flex items-center justify-center text-white hover:text-red-500 transition-colors"
                           >
                              {playbackState.isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                           </button>
                           <button className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                              <Zap size={20} className="rotate-180" />
                           </button>
                           <button className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                              <Zap size={20} />
                           </button>
                        </div>

                        <div className="flex items-center gap-4">
                           <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white transition-colors">
                              <Volume2 size={20} className={isMuted ? 'text-red-500' : ''} />
                           </button>
                           <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full" style={{ width: `${currentVolume * 100}%` }} />
                           </div>
                        </div>

                        <span className="text-sm font-bold text-white/40 tracking-widest tabular-nums">
                           {formatTime(currentTime)} <span className="mx-2 text-zinc-800">/</span> {formatTime(duration)}
                        </span>
                     </div>

                     <div className="flex items-center gap-6 text-zinc-500">
                        <button className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-white hover:bg-white/10 transition-colors">HD</button>
                        <button className="p-1 hover:text-white transition-colors"><Subtitles size={20} /></button>
                        <button className="p-1 hover:text-white transition-colors"><PictureInPicture2 size={20} /></button>
                        <button onClick={() => playerRef.current?.getInternalPlayer()?.requestFullscreen()} className="p-1 hover:text-white transition-colors"><Maximize2 size={20} /></button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

