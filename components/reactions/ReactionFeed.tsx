"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { usePlayerState } from '@/hooks/usePlayerState';

interface ReactionFeedProps {
  movieId: string;
}

export function ReactionFeed({ movieId }: ReactionFeedProps) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Integrate directly with existing Zustand store if we are on the player page
  // Allows click-to-seek mechanic instantly
  const { seek, isFullscreen, setMovieReactions } = usePlayerState(); 
  
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/reactions?movieId=${movieId}`);
        if (!res.ok) throw new Error('Failed to fetch reactions');
        const data = await res.json();
        setReactions(data.reactions);
        setMovieReactions(data.reactions); // Feed them to the player's progress bar
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, [movieId, setMovieReactions]);

  // Format timestamp function
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const jumpToReaction = (timestamp: number) => {
    seek(timestamp);
    // Automatically trigger play if needed or let user hit play
    usePlayerState.getState().setPlaying(true);
  };

  if (isFullscreen) return null; // Hide feed when in immersive fullscreen

  return (
    <div className="w-full bg-[#141414] min-h-screen py-10 px-4 md:px-8 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wide">
            Community <span className="text-[#E50914]">Reactions</span>
          </h2>
          <span className="text-white/50 text-sm font-medium uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            {reactions.length} Clips
          </span>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] h-[480px] bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reactions.length === 0 ? (
          <div className="w-full h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-white/60 font-medium">No reactions yet.</p>
            <p className="text-white/40 text-sm mt-1">Be the first to drop a reaction!</p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar snap-x snap-mandatory">
            <AnimatePresence>
              {reactions.map((reaction, idx) => (
                <motion.div
                  key={reaction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative min-w-[280px] w-[280px] h-[498px] bg-black rounded-2xl overflow-hidden snap-center flex-shrink-0 group shadow-2xl border border-white/10"
                >
                  {/* Video Background */}
                  <video 
                    src={reaction.videoUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    loop
                    muted
                    autoPlay
                    playsInline
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Header: Timestamp Jump */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <button 
                      onClick={() => jumpToReaction(reaction.timestamp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-[#E50914] backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest transition-colors border border-white/20 hover:border-[#E50914]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      @ {formatTime(reaction.timestamp)}
                    </button>
                    <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-white/70 uppercase">
                      User-{reaction.userId.substring(0,4)}
                    </div>
                  </div>

                  {/* Right Side Social Actions */}
                  <div className="absolute right-4 bottom-24 flex flex-col gap-5 z-10">
                    <div className="flex flex-col items-center gap-1 cursor-pointer group/btn">
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover/btn:bg-white/20 transition-colors border border-white/10">
                        <Heart className="w-5 h-5 text-white/90 group-hover/btn:scale-110 group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-all" />
                      </div>
                      <span className="text-white/80 text-[10px] font-bold">12K</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 cursor-pointer group/btn">
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover/btn:bg-white/20 transition-colors border border-white/10">
                        <MessageCircle className="w-5 h-5 text-white/90 group-hover/btn:scale-110 transition-all" />
                      </div>
                      <span className="text-white/80 text-[10px] font-bold">342</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 cursor-pointer group/btn">
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center group-hover/btn:bg-white/20 transition-colors border border-white/10">
                        <Share2 className="w-5 h-5 text-white/90 group-hover/btn:scale-110 transition-all" />
                      </div>
                      <span className="text-white/80 text-[10px] font-bold">Share</span>
                    </div>
                  </div>

                  {/* Bottom Info Info */}
                  <div className="absolute bottom-4 left-4 right-16 z-10">
                    <h3 className="text-white font-bold text-sm leading-tight mb-1 drop-shadow-md">
                      YOOO I CANNOT BELIEVE THEY DID THAT 🤯
                    </h3>
                    <p className="text-white/60 text-xs font-medium line-clamp-1">#reaction #moviescene #omg</p>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
