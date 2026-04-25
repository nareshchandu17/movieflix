"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactionCard } from './ReactionCard';
import { Loader2, Camera, ChevronUp, ChevronDown } from 'lucide-react';
import { UploadModal } from './UploadModal';

interface Reaction {
  _id: string;
  movieId: number;
  videoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  likes: number;
  views: number;
}

interface ReelsPlayerProps {
  initialReactions?: Reaction[];
  movieId?: number;
}

export function ReelsPlayer({ initialReactions = [], movieId }: ReelsPlayerProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    try {
      const url = movieId 
        ? `/api/reactions?movieId=${movieId}&limit=10`
        : `/api/reactions?type=global&limit=10`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.length < 10) setHasMore(false);
      
      setReactions(prev => {
        const existingIds = new Set(prev.map(r => r._id));
        const uniqueNew = data.filter((r: Reaction) => !existingIds.has(r._id));
        return [...prev, ...uniqueNew];
      });
    } catch (error) {
      console.error('Failed to fetch more reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, movieId]);

  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchMore();
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollTop;
    const itemHeight = container.clientHeight;
    const index = Math.round(scrollPos / itemHeight);
    
    if (index !== activeIndex) {
      setActiveIndex(index);
    }

    if (scrollPos + itemHeight * 2 >= container.scrollHeight) {
      fetchMore();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#050505] flex flex-col pt-6 pb-2">
      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-start px-8 shrink-0 mb-2">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-white">Fan Reactions</h1>
          <p className="text-zinc-400">Real fans. <span className="text-red-500">Real emotions.</span></p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 border border-red-900 bg-black hover:bg-red-950/40 text-red-500 px-5 py-2.5 rounded-xl font-medium transition-all"
        >
          <Camera className="w-5 h-5" />
          Create
        </button>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reactions.length > 0 ? (
            reactions.map((reaction, index) => (
              <ReactionCard 
                key={reaction._id}
                reaction={reaction} 
                isActive={index === activeIndex} 
              />
            ))
          ) : !isLoading && (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <p>No reactions yet. Be the first!</p>
            </div>
          )}

          {isLoading && (
            <div className="w-full h-20 flex items-center justify-center snap-center bg-[#050505]">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Swipe instruction */}
        <div className="absolute bottom-2 flex flex-col items-center text-zinc-500 shrink-0 pointer-events-none z-0">
           <ChevronUp className="w-6 h-6 mb-0 opacity-50" />
           <p className="text-xs text-center opacity-70">Swipe up / down<br/>for next / previous</p>
           <ChevronDown className="w-6 h-6 mt-0 opacity-50" />
        </div>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        defaultMovieId={movieId}
      />
    </div>
  );
}
