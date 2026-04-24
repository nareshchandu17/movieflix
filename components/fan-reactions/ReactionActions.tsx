"use client";

import React, { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionActionsProps {
  reactionId: string;
  initialLikes: number;
  initialViews: number;
}

export function ReactionActions({ reactionId, initialLikes, initialViews }: ReactionActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [views] = useState(initialViews);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading || isLiked) return;
    
    // Optimistic update
    setLikes(prev => prev + 1);
    setIsLiked(true);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/reactions/${reactionId}/like`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to like');
      const data = await res.json();
      setLikes(data.likes);
    } catch (error) {
      console.error(error);
      // Revert if failed
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-10">
      <div className="flex flex-col items-center">
        <button 
          onClick={handleLike}
          disabled={isLoading || isLiked}
          className="bg-black/40 p-3 rounded-full backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 mb-1"
        >
          <Heart 
            className={cn("w-7 h-7 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")} 
          />
        </button>
        <span className="text-white text-sm font-semibold drop-shadow-md">
          {formatCount(likes)}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm mb-1">
          <Eye className="w-7 h-7 text-white" />
        </div>
        <span className="text-white text-sm font-semibold drop-shadow-md">
          {formatCount(views)}
        </span>
      </div>
    </div>
  );
}
