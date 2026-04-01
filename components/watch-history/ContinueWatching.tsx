"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

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
  const { currentProfile } = useProfile();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentMetadata, setContentMetadata] = useState<Map<string, ContentMetadata>>(new Map());

  useEffect(() => {
    if (currentProfile) {
      fetchContinueWatching();
    }
  }, [currentProfile]);

  const fetchContinueWatching = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history/continue?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
        
        // Fetch content metadata for each item
        const metadataPromises = data.data.map((item: ContinueWatchingItem) => 
          fetchContentMetadata(item.contentId)
        );
        
        const metadataResults = await Promise.all(metadataPromises);
        const metadataMap = new Map();
        
        data.data.forEach((item: ContinueWatchingItem, index: number) => {
          if (metadataResults[index]) {
            metadataMap.set(item.contentId, metadataResults[index]);
          }
        });
        
        setContentMetadata(metadataMap);
      }
    } catch (error) {
      console.error('Failed to fetch continue watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentMetadata = async (contentId: string): Promise<ContentMetadata | null> => {
    try {
      // Mock content metadata - in real app, fetch from your content API
      return {
        id: contentId,
        title: `Content ${contentId}`,
        thumbnail: `/thumbnails/${contentId}.jpg`,
        description: 'Sample content description',
        year: 2024,
        rating: 'PG-13',
        duration: 3600
      };
    } catch (error) {
      console.error('Failed to fetch content metadata:', error);
      return null;
    }
  };

  const handleWatchClick = (contentId: string) => {
    router.push(`/watch/${contentId}`);
  };

  const formatTimeAgo = (dateString: string): string => {
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
  };

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
                  <img
                    src={metadata?.thumbnail || '/default-thumbnail.jpg'}
                    alt={metadata?.title || 'Content'}
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
