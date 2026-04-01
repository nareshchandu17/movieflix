import { useCallback } from "react";
import useSWR from "swr";

export interface WatchProgress {
  contentId: string;
  contentType: "Movie" | "Series";
  episodeId?: string;
  timestamp: number;
  lastWatched: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useWatchProgress = () => {
  const { data, error, mutate, isLoading } = useSWR('/api/history', fetcher);
  
  const progress: WatchProgress[] = data?.history || [];

  const updateProgress = useCallback(async (
    contentId: string,
    contentType: "Movie" | "Series",
    timestamp: number,
    episodeId?: string
  ) => {
    // Optimistic Update
    const updatedProgress = [...progress];
    const existingIndex = updatedProgress.findIndex(p => p.contentId === contentId);
    
    if (existingIndex >= 0) {
      updatedProgress[existingIndex] = { ...updatedProgress[existingIndex], timestamp, lastWatched: new Date().toISOString() };
    } else {
      updatedProgress.unshift({ contentId, contentType, episodeId, timestamp, lastWatched: new Date().toISOString() });
    }
    
    mutate({ history: updatedProgress }, false);

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          contentType,
          episodeId,
          timestamp,
        }),
      });

      if (!res.ok) throw new Error('Failed to update progress');
      mutate();
    } catch (err) {
      console.error("Failed to update progress", err);
      mutate(); // rollback
    }
  }, [progress, mutate]);

  const getContinueWatching = () => {
    return progress
      .filter((p) => p.timestamp > 0)
      .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
      .slice(0, 10);
  };

  return {
    progress,
    isHydrated: !isLoading && !error,
    updateProgress,
    getContinueWatching,
  };
};
