"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactionCard } from './ReactionCard';
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
        // Filter out duplicates
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

  // Initial fetch if no initialReactions
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

    // Near end? Load more.
    if (scrollPos + itemHeight * 2 >= container.scrollHeight) {
      fetchMore();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black">
      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between">
        <Link href="/">
          <button className="bg-black/40 p-2 rounded-full backdrop-blur-sm text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Post Reaction
        </button>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reactions.length > 0 ? (
          reactions.map((reaction, index) => (
            <div key={reaction._id} className="w-full h-full snap-start">
              <ReactionCard 
                reaction={reaction} 
                isActive={index === activeIndex} 
              />
            </div>
          ))
        ) : !isLoading && (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
            <p>No reactions yet. Be the first!</p>
          </div>
        )}

        {isLoading && (
          <div className="w-full h-20 flex items-center justify-center bg-black">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        defaultMovieId={movieId}
      />
    </div>
  );
}
