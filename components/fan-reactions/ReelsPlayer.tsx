"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactionCard } from './ReactionCard';
import { Loader2, Camera, ChevronUp, ChevronDown, Grid, LayoutList, Trash2, PlayCircle, Video, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { UploadModal } from './UploadModal';

interface Reaction {
  _id: string;
  movieId: number;
  videoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  likes: number;
  views: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReelsPlayerProps {
  initialReactions?: Reaction[];
  movieId?: number;
}

export function ReelsPlayer({ initialReactions = [], movieId }: ReelsPlayerProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [userReactions, setUserReactions] = useState<Reaction[]>([]);
  const [view, setView] = useState<'feed' | 'mine'>('feed');
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

  const fetchUserReactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reactions?type=mine');
      const data = await res.json();
      setUserReactions(data);
    } catch (error) {
      console.error('Failed to fetch user reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reaction?')) return;

    try {
      const res = await fetch(`/api/reactions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUserReactions(prev => prev.filter(r => r._id !== id));
        setReactions(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete reaction:', error);
    }
  };

  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchMore();
    }
    fetchUserReactions();
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
      <div className="w-full max-w-5xl mx-auto flex justify-between items-end px-8 shrink-0 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-white">Fan Reactions</h1>
            <p className="text-zinc-400">Real fans. <span className="text-red-500">Real emotions.</span></p>
          </div>

          {/* Tabs */}
          <div className="flex bg-zinc-900/50 p-1 rounded-lg w-fit border border-zinc-800">
            <button
              onClick={() => setView('feed')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'feed' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <LayoutList className="w-4 h-4" />
              Feed
            </button>
            <button
              onClick={() => setView('mine')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'mine' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Grid className="w-4 h-4" />
              Your Reactions
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-900/20 active:scale-95"
        >
          <Camera className="w-5 h-5" />
          Post Yours
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative">
        {view === 'feed' ? (
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
        ) : (
          /* Grid View for "Your Reactions" */
          <div className="w-full max-w-5xl h-full overflow-y-auto px-8 pb-12 custom-scrollbar">
            {userReactions.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userReactions.map((reaction) => (
                  <div key={reaction._id} className="group relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                    <img
                      src={reaction.thumbnailUrl}
                      alt={reaction.caption || 'Your reaction'}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white/80" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {reaction.status === 'pending' ? (
                        <div className="flex items-center gap-1.5 bg-amber-500/10 backdrop-blur-md text-amber-500 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Pending
                        </div>
                      ) : reaction.status === 'rejected' ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 backdrop-blur-md text-red-500 px-2 py-1 rounded-full text-[10px] font-bold border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-green-500/10 backdrop-blur-md text-green-500 px-2 py-1 rounded-full text-[10px] font-bold border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs text-white line-clamp-1 mb-2">{reaction.caption || 'No caption'}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(reaction._id);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-1.5 rounded-lg text-xs font-medium transition-all border border-red-600/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Video className="w-12 h-12 opacity-20" />
                <p>You haven't posted any reactions yet.</p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="text-red-500 hover:underline font-medium"
                >
                  Post your first reaction now
                </button>
              </div>
            )}

            {isLoading && (
              <div className="w-full h-40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Swipe instruction (only for feed) */}
        {view === 'feed' && reactions.length > 0 && (
          <div className="absolute bottom-2 flex flex-col items-center text-zinc-500 shrink-0 pointer-events-none z-0">
            <ChevronUp className="w-6 h-6 mb-0 opacity-50" />
            <p className="text-xs text-center opacity-70">Swipe up / down<br />for next / previous</p>
            <ChevronDown className="w-6 h-6 mt-0 opacity-50" />
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newReaction) => {
          setReactions(prev => [newReaction, ...prev]);
          setUserReactions(prev => [newReaction, ...prev]);
          // If we're on the first slide, we might want to stay there
          setActiveIndex(0);
        }}
        defaultMovieId={movieId}
      />
    </div>
  );
}
