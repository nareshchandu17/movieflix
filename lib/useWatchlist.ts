import { useCallback } from 'react';
import useSWR from 'swr';
import { WatchlistItem, TMDBMovie, TMDBTVShow } from './types';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useWatchlist() {
  const { data, error, mutate, isLoading } = useSWR('/api/watchlist', fetcher);
  
  const watchlist = data?.watchlist || [];

  const addToWatchlist = useCallback(async (item: TMDBMovie | TMDBTVShow) => {
    const isTV = 'name' in item;
    
    // Optimistic UI update
    const watchlistItem: WatchlistItem = {
      id: item.id,
      type: isTV ? 'tv' : 'movie',
      title: isTV ? item.name : item.title,
      poster_path: item.poster_path,
      addedAt: new Date().toISOString(),
    };
    
    mutate({ watchlist: [watchlistItem, ...watchlist] }, false);

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id.toString(),
          contentType: isTV ? 'Series' : 'Movie'
        }),
      });

      if (!res.ok) throw new Error('Failed to add to watchlist');
      toast.success('Added to watchlist');
      mutate(); // Re-validate
    } catch (err) {
      toast.error('Failed to add to watchlist');
      mutate(); // Rollback on error
    }
  }, [watchlist, mutate]);

  const removeFromWatchlist = useCallback(async (id: number, type?: 'movie' | 'tv') => {
    // Optimistic UI update
    const updated = watchlist.filter((w: any) => w.contentId !== id.toString());
    mutate({ watchlist: updated }, false);

    try {
      const res = await fetch(`/api/watchlist?contentId=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove from watchlist');
      toast.success('Removed from watchlist');
      mutate(); // Re-validate
    } catch (err) {
      toast.error('Failed to remove from watchlist');
      mutate(); // Rollback on error
    }
  }, [watchlist, mutate]);

  const isInWatchlist = useCallback((id: number, type?: 'movie' | 'tv') => {
    return watchlist.some((item: any) => item.contentId === id.toString());
  }, [watchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoading: isLoading && !error,
  };
}