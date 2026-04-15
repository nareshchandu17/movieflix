"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useProfile } from '@/contexts/ProfileContext';
import { api } from '@/lib/api';
import { TMDBMovieDetail, TMDBTVDetail } from '@/lib/types';

interface ContinueWatchingItem {
  _id: string;
  contentId: string;
  contentType: 'movie' | 'series' | 'episode';
  progress: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
  progressPercentage: number;
  timeRemaining: number;
  formattedProgress: string;
  formattedDuration: string;
  formattedTimeRemaining: string;
}

interface ContinueWatchingResponse {
  success: boolean;
  data: ContinueWatchingItem[];
}

interface ContentMetadata {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  year?: number;
  rating?: string;
  duration?: number;
}

export default function ContinueWatching() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentMetadata, setContentMetadata] = useState<Map<string, ContentMetadata>>(new Map());

  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }, []);

  const handleWatchClick = useCallback((contentId: string) => {
    router.push(`/watch/${contentId}`);
  }, [router]);

  const fetchContentMetadata = useCallback(async (contentId: string, contentType: string): Promise<ContentMetadata | null> => {
    try {
      const tmdbType = (contentType === 'series' || contentType === 'episode') ? 'tv' : 'movie';
      const id = parseInt(contentId);

      if (isNaN(id)) return null;

      const data = tmdbType === 'movie' 
        ? await api.getDetails('movie', id) 
        : await api.getDetails('tv', id);
      
      let title = 'Unknown Title';
      let year: number | undefined = undefined;
      let duration: number | undefined = undefined;

      // Type-safe property access based on media type
      if (tmdbType === 'movie') {
        const movie = data as TMDBMovieDetail;
        title = movie.title;
        year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
        duration = movie.runtime || undefined;
      } else {
        const tv = data as TMDBTVDetail;
        title = tv.name;
        year = tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : undefined;
        duration = tv.episode_run_time?.[0] || undefined;
      }

      return {
        id: contentId,
        title,
        thumbnail: data.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}`
          : data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : '/default-thumbnail.jpg',
        description: data.overview || '',
        year,
        rating: data.vote_average ? data.vote_average.toFixed(1) : undefined,
        duration
      };
    } catch (error) {
      console.error('Failed to fetch content metadata:', error);
      return null;
    }
  }, []);

  const fetchContinueWatching = useCallback(async () => {
    if (!activeProfile) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/history/continue?limit=10');
      const result: ContinueWatchingResponse = await response.json();

      if (result.success) {
        setItems(result.data);

        // Fetch content metadata for each item
        const metadataPromises = result.data.map((item) =>
          fetchContentMetadata(item.contentId, item.contentType)
        );

        const metadataResults = await Promise.all(metadataPromises);
        const metadataMap = new Map<string, ContentMetadata>();

        result.data.forEach((item, index) => {
          const metadata = metadataResults[index];
          if (metadata) {
            metadataMap.set(item.contentId, metadata);
          }
        });

        setContentMetadata(metadataMap);
      }
    } catch (error) {
      console.error('Failed to fetch continue watching:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProfile, fetchContentMetadata]);

  useEffect(() => {
    fetchContinueWatching();
  }, [fetchContinueWatching]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
        <div className="flex gap-4 overflow-x-scroll">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-64 flex-shrink-0">
              <div className="bg-gray-800 rounded-lg aspect-video mb-2 animate-pulse" />
              <div className="h-4 bg-gray-800 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
        <div className="text-center py-8 bg-gray-900 rounded-lg">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No content in progress</p>
          <p className="text-sm text-gray-500 mt-2">Start watching something to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
        <button
          onClick={() => router.push('/history')}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          See all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-scroll scrollbar-hide">
        {items.map((item, index) => {
          const metadata = contentMetadata.get(item.contentId);

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-64 flex-shrink-0 cursor-pointer group"
              onClick={() => handleWatchClick(item.contentId)}
            >
              <div className="relative mb-2">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                  <Image
                    src={metadata?.thumbnail || '/default-thumbnail.jpg'}
                    alt={metadata?.title || 'Content'}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div
                      className="h-full bg-red-600 transition-all duration-200"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>

                  {/* Completion Badge */}
                  {item.completed && (
                    <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Time Remaining */}
                  {!item.completed && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                      {item.formattedTimeRemaining}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {metadata?.title || `Content ${item.contentId}`}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{item.contentType}</span>
                  <span>{formatTimeAgo(item.lastWatchedAt)}</span>
                </div>

                {/* Progress Info */}
                <div className="text-xs text-gray-500">
                  {item.completed ? (
                    <span className="text-green-400">Completed</span>
                  ) : (
                    <span>
                      {item.formattedProgress} / {item.formattedDuration}
                      ({Math.round(item.progressPercentage)}%)
                    </span>
                  )}
                </div>

                {/* Additional Metadata */}
                {metadata && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {metadata.year && <span>{metadata.year}</span>}
                    {metadata.rating && <span>• {metadata.rating}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center mt-4">
        <div className="w-12 h-1 bg-gray-700 rounded-full">
          <div className="w-8 h-1 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
