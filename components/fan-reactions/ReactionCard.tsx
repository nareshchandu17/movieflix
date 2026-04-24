"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { ReactionActions } from './ReactionActions';

interface Reaction {
  _id: string;
  movieId: number;
  videoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  likes: number;
  views: number;
}

interface ReactionCardProps {
  reaction: Reaction;
  isActive: boolean;
}

export function ReactionCard({ reaction, isActive }: ReactionCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(e => console.log('Autoplay prevented:', e));
    } else {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  useEffect(() => {
    let viewTimer: NodeJS.Timeout;
    
    if (isActive && !hasViewed) {
      viewTimer = setTimeout(() => {
        fetch(`/api/reactions/${reaction._id}/view`, { method: 'POST' })
          .catch(e => console.error('Failed to register view:', e));
        setHasViewed(true);
      }, 2000);
    }

    return () => clearTimeout(viewTimer);
  }, [isActive, hasViewed, reaction._id]);

  return (
    <div className="relative w-full h-full snap-center bg-black overflow-hidden flex justify-center items-center">
      <video
        ref={videoRef}
        src={reaction.videoUrl}
        poster={reaction.thumbnailUrl}
        className="w-full h-full object-cover max-w-[600px]"
        loop
        playsInline
        muted={false} // Depending on mobile, might need muted to autoplay, but reels usually unmute on tap or autoplay with sound if allowed
      />
      
      {/* Fallback play overlay if paused, could be added later */}

      <ReactionActions 
        reactionId={reaction._id} 
        initialLikes={reaction.likes} 
        initialViews={reaction.views + (hasViewed ? 1 : 0)} 
      />

      {/* Bottom Info Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 max-w-[600px] mx-auto">
        {reaction.caption && (
          <p className="text-white text-base mb-4 drop-shadow-md">{reaction.caption}</p>
        )}
        
        <Link href={`/movie/${reaction.movieId}`}>
          <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors">
            <Play className="w-4 h-4 text-white fill-white" />
            <span className="text-white font-medium text-sm">Watch Movie</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
