"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Play, Heart, Share2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ReactionCardProps {
  movieId: string;
  reaction: {
    _id: string;
    videoUrl: string;
    thumbnailUrl: string;
    movieTimestamp: number;
    moodEmoji: string;
    duration: number;
    likesCount: number;
    sharesCount: number;
    userId: {
      name: string;
      avatar: string;
    };
  };
}

export function ReactionCard({ reaction, movieId }: ReactionCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTimestamp = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Link href={`/watch/${movieId}?reactionId=${reaction._id}`} className="block">
      <motion.div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative flex flex-col w-[280px] h-[400px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
      >
      {/* Media Content (75%) */}
      <div className="relative h-[75%] w-full overflow-hidden bg-black">
        <Image
          src={reaction.thumbnailUrl || "/api/placeholder/280/300"}
          alt={`Reaction to movie`}
          fill
          className={`object-cover transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />
        
        <AnimatePresence>
          {isHovering && (
            <motion.video
              ref={videoRef}
              src={reaction.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg flex items-center gap-1.5">
            <span className="text-lg leading-none">{reaction.moodEmoji}</span>
          </div>
          <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg flex items-center gap-1">
            <Clock className="w-3 h-3 text-white/70" />
            <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">Scene {formatTimestamp(reaction.movieTimestamp)}</span>
          </div>
        </div>

        {!isHovering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
            </div>
        )}
      </div>

      {/* User Info (25%) */}
      <div className="h-[25%] p-4 flex flex-col justify-between bg-gradient-to-b from-white/[0.05] to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex-shrink-0">
             <Image 
                src={reaction.userId.avatar || "/default-avatar.png"} 
                alt={reaction.userId.name} 
                fill 
                className="object-cover"
             />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-bold text-sm truncate">{reaction.userId.name}</span>
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{reaction.duration}s Reaction</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-white/40 hover:text-red-500 transition-colors group/action">
                    <Heart className="w-4 h-4 group-hover/action:fill-red-500" />
                    <span className="text-xs font-bold leading-none">{reaction.likesCount}</span>
                </button>
                <button className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 transition-colors group/action">
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs font-bold leading-none">{reaction.sharesCount}</span>
                </button>
            </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
