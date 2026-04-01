"use client";

import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { X, Maximize2, Minimize2, Heart, Share2, Play } from 'lucide-react';

export function ReactionOverlay() {
  const { 
    activeReaction, 
    setActiveReaction, 
    reactionLayout, 
    setReactionLayout,
    playing,
    currentTime,
    seek
  } = usePlayerState();

  const reactionPlayerRef = useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  // Sync logic: Reaction video should start relative to the movie timestamp
  // movie_current_time - reaction_movie_timestamp = reaction_video_current_time
  useEffect(() => {
    if (activeReaction && isReady && reactionPlayerRef.current) {
      const reactionOffset = currentTime - activeReaction.movieTimestamp;
      
      // If we are within the duration of the reaction clip
      if (reactionOffset >= 0 && reactionOffset <= activeReaction.duration) {
        reactionPlayerRef.current.seekTo(reactionOffset, 'seconds');
      } else if (reactionOffset > activeReaction.duration) {
        // Reaction finished, close overlay
        setActiveReaction(null);
      }
    }
  }, [activeReaction, isReady, currentTime, setActiveReaction]);

  if (!activeReaction) return null;

  const isPip = reactionLayout === 'pip';

  return (
    <AnimatePresence>
      <motion.div
        initial={isPip ? { opacity: 0, scale: 0.8, x: 20 } : { x: '100%' }}
        animate={isPip ? { opacity: 1, scale: 1, x: 0 } : { x: 0 }}
        exit={isPip ? { opacity: 0, scale: 0.8, x: 20 } : { x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`z-[60] pointer-events-auto shadow-2xl overflow-hidden border border-white/10 backdrop-blur-md bg-black/40
          ${isPip 
            ? 'fixed bottom-24 right-8 w-[320px] aspect-video rounded-2xl' 
            : 'absolute top-0 right-0 w-[40%] h-full border-l'
          }`}
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Synced</span>
              <span className="text-white/60 text-[10px] font-medium">{activeReaction.userId?.name}'s Reaction</span>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setReactionLayout(isPip ? 'split' : 'pip')}
                className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-all"
              >
                {isPip ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={() => setActiveReaction(null)}
                className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Reaction Video */}
        <div className="relative w-full h-full">
           <ReactPlayer
             ref={reactionPlayerRef}
             url={activeReaction.videoUrl}
             playing={playing}
             width="100%"
             height="100%"
             muted={false} // Reactions usually have audio
             onReady={() => setIsReady(true)}
             style={{ objectFit: 'cover' }}
           />
           
           {/* Context Metadata Overlay (Bottom) */}
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-gray-800">
                       <img src={activeReaction.userId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeReaction.userId?.name}`} alt="" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white leading-none mb-1">{activeReaction.moodEmoji} That specific moment!</p>
                       <p className="text-[10px] text-white/40 font-medium">Replaying with scene</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-lg text-white hover:bg-red-600 transition-colors group">
                       <Heart className="w-3 h-3 group-hover:fill-current" />
                       <span className="text-[10px] font-bold">{activeReaction.likesCount}</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sync Indicator */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-red-600 shadow-[0_0_10px_rgba(229,9,20,0.8)] z-20 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
