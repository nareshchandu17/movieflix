"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Calendar, Plus, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie, api } from "@/lib/types";
import { api as tmdbApi } from "@/lib/api";

interface Episode {
  id: string;
  title: string;
  episode: number;
  season: number;
  duration: number;
  progress: number;
  thumbnail: string;
  showId: number;
}

interface ContinueWatchingSeriesProps {
  title?: string;
}

export default function ContinueWatchingSeries({ title = "Continue Watching" }: ContinueWatchingSeriesProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock data for continue watching episodes
  useEffect(() => {
    const mockEpisodes: Episode[] = [
      {
        id: "ep1",
        title: "The Dark Knight Rises",
        episode: 4,
        season: 1,
        duration: 45,
        progress: 75,
        thumbnail: "/placeholder-episode.jpg",
        showId: 123
      },
      {
        id: "ep2",
        title: "Joker's Wild Card",
        episode: 3,
        season: 1,
        duration: 52,
        progress: 45,
        thumbnail: "/placeholder-episode2.jpg",
        showId: 124
      },
      {
        id: "ep3",
        title: "The Final Chapter",
        episode: 2,
        season: 1,
        duration: 48,
        progress: 20,
        thumbnail: "/placeholder-episode3.jpg",
        showId: 125
      },
      {
        id: "ep4",
        title: "Breaking Point",
        episode: 1,
        season: 2,
        duration: 50,
        progress: 90,
        thumbnail: "/placeholder-episode4.jpg",
        showId: 126
      }
    ];
    
    setEpisodes(mockEpisodes);
    setLoading(false);
  }, []);

  const nextSlide = useCallback(() => {
    if (episodes.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(episodes.length / 4));
    }
  }, [episodes.length]);

  const prevSlide = useCallback(() => {
    if (episodes.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(episodes.length / 4)) % Math.ceil(episodes.length / 4));
    }
  }, [episodes.length]);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 320 + 16; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth * 4,
        behavior: 'smooth'
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRemainingTime = (duration: number, progress: number) => {
    const remaining = Math.round((duration * (100 - progress)) / 100);
    return formatTime(remaining);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '320px' }}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-blue-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
          onScroll={updateScrollButtons}
          style={{ scrollPaddingLeft: "3rem" }}
        >
          {episodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '320px' }}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => useRouter().push(`/watch/${episode.showId}`)}>
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="320px"
                />

                {/* Progress Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${episode.progress}%` }}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                    Episode {episode.episode}
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                    {getRemainingTime(episode.duration, episode.progress)} remaining
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <Play className="w-6 h-6 text-white ml-1" />
                  </motion.div>
                </div>

                {/* Episode Info */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  S{episode.season}:E{episode.episode}
                </div>
              </div>

              {/* Episode Details */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight mb-1">
                  {episode.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(episode.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{episode.progress}% complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:border-blue-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
