"use client";

import React, { useState, useEffect } from 'react';
import { ReactionCard } from './ReactionCard';
import { PlusCircle, Loader2 } from 'lucide-react';
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

export function MovieReactionsSection({ movieId }: { movieId: number }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  // Need to track which one is active (visible) for playing, but for horizontal scroll, we can just use intersection observer or let user click to play
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/reactions?movieId=${movieId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json();
        // The API returns an array directly
        if (Array.isArray(data)) {
          setReactions(data);
        } else if (data.success && data.reactions) {
          setReactions(data.reactions);
        } else if (data.success && data.data?.reactions) {
          setReactions(data.data.reactions);
        } else {
          setReactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch movie reactions:', error);
        setReactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReactions();
  }, [movieId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollLeft;
    const itemWidth = 320; // Approx card width + gap
    const index = Math.round(scrollPos / itemWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="py-12 bg-black">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Fan Reactions</h2>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Post Reaction
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : reactions.length > 0 ? (
          <div 
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar"
            onScroll={handleScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reactions.map((reaction, index) => (
              <div 
                key={reaction._id} 
                className="w-[300px] h-[533px] flex-shrink-0 snap-start rounded-xl overflow-hidden border border-zinc-800"
              >
                <ReactionCard 
                  reaction={reaction} 
                  isActive={index === activeIndex} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/50 rounded-xl p-12 text-center border border-zinc-800/50 flex flex-col items-center justify-center">
            <p className="text-zinc-400 mb-4">No reactions yet for this movie.</p>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold transition-colors"
            >
              Be the first to react!
            </button>
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={(newReaction) => {
          setReactions(prev => [newReaction, ...prev]);
          setActiveIndex(0);
        }}
        defaultMovieId={movieId}
      />
    </div>
  );
}
