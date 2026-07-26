/**
 * @file useWatchProgress.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

export interface WatchProgress {
  contentId: string;
  currentTime: number;
  duration: number;
  timestamp: number;
  title?: string;
  type?: 'movie' | 'series';
  backdrop_path?: string;
}

export function useWatchProgress() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getContinueWatching = useCallback(() => {
    if (typeof window === 'undefined') return [];

    const items: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('progress_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.contentId && data.currentTime > 0) {
            // Check if not completed
            const completedKey = `completed_${data.contentId}`;
            const isCompleted = localStorage.getItem(completedKey);
            
            if (!isCompleted) {
              items.push({
                id: data.contentId,
                type: data.type || 'movie',
                title: data.title || `Content ${data.contentId}`,
                backdrop_path: data.backdrop_path || null,
                timeWatched: data.currentTime,
                totalDuration: data.duration || 1,
                timestamp: data.timestamp || 0
              });
            }
          }
        } catch (e) {
          console.error('Error parsing watch progress:', e);
        }
      }
    }

    return items.sort((a: any, b: any) => b.timestamp - a.timestamp);
  }, []);

  return {
    getContinueWatching,
    isHydrated
  };
}
