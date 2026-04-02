"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { api as tmdbApi } from "@/lib/api";

interface ContinueWatchingItem {
  id: string;
  title: string;
  episodeNumber?: number;
  seasonNumber?: number;
  progress: number;
  duration: number;
  backdropPath: string | null;
  posterPath: string | null;
  type: 'movie' | 'series' | 'episode';
  contentId: string;
  seriesId?: string;
  overview?: string;
}

interface ContinueWatchingSeriesProps {
  title?: string;
}

export default function ContinueWatchingSeries({ title = "Continue Watching" }: ContinueWatchingSeriesProps) {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { preferences } = useUserPreferences();

  const fetchMetadata = useCallback(async () => {
    if (!preferences?.watchHistory && !preferences?.episodeProgress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Combine watch history and episode progress
      // For now, let's focus on the most recent 10 items
      const history = [...(preferences.watchHistory || [])]
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 10);

      const resolvedItems = await Promise.all(
        history.map(async (item) => {
          try {
            const type = item.contentType === 'series' || item.contentType === 'episode' ? 'tv' : 'movie';
            const fetchId = parseInt(item.metadata?.seriesId || item.contentId);
            
            if (isNaN(fetchId)) return null;

            // Use explicit checks to satisfy TMDB API overloads
            const data = type === 'movie' 
              ? await tmdbApi.getDetails('movie', fetchId)
              : await tmdbApi.getDetails('tv', fetchId);
            
            return {
              id: item.contentId,
              title: (data as any).title || (data as any).name || item.metadata?.title || "Untitled",
              episodeNumber: item.metadata?.episode,
              seasonNumber: item.metadata?.season,
              progress: item.progress,
              duration: item.duration || 100,
              backdropPath: data.backdrop_path,
              posterPath: data.poster_path,
              type: item.contentType,
              contentId: item.contentId,
              seriesId: item.metadata?.seriesId,
              overview: data.overview
            } as ContinueWatchingItem;
          } catch (err) {
            console.error(`Error fetching metadata for ${item.contentId}:`, err);
            return null;
          }
        })
      );

      const filteredItems = resolvedItems.filter((item): item is ContinueWatchingItem => item !== null && item.progress < 95);

      setItems(filteredItems);
    } catch (error) {
      console.error("Failed to fetch continue watching metadata:", error);
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!loading && items.length === 0) return null;

  return (
    <div className="relative group/section py-4">
      {/* Title with consistent left alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-2 group">
          {title}
          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
        </h2>
      </div>

      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/40 hover:bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white border-r border-white/5"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] md:w-[400px] aspect-video bg-white/5 animate-pulse rounded-xl" />
            ))
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-shrink-0 w-[280px] md:w-[400px] snap-start relative group/card"
              >
                {/* Netflix Style Progress Card */}
                <div 
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 hover:border-blue-500/50 hover:shadow-blue-500/10"
                  onClick={() => router.push(`/watch/${item.id}`)}
                >
                  <Image
                    src={item.backdropPath ? `https://image.tmdb.org/t/p/w780${item.backdropPath}` : '/placeholder-backdrop.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110 opacity-70 group-hover/card:opacity-90"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-4 group-hover/card:translate-y-0">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40">
                      <Play className="w-6 h-6 text-white ml-1 fill-white" />
                    </div>
                  </div>

                  {/* Content Info Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white font-bold text-sm md:text-base line-clamp-1">
                        {item.title}
                      </h3>
                      {item.type !== 'movie' && item.episodeNumber && (
                        <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                          S{item.seasonNumber} : E{item.episodeNumber}
                        </p>
                      )}
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="mt-3 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info on Hover (Premium Detail) */}
                <div className="mt-3 flex items-center justify-between px-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <Info className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    {100 - item.progress}% left
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/40 hover:bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white border-l border-white/5"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
