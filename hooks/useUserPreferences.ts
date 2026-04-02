import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Types for user preferences
export interface WatchlistItem {
  contentId: string;
  contentType: 'movie' | 'series' | 'episode';
  addedAt: Date;
  metadata?: {
    title?: string;
    poster?: string;
    overview?: string;
  };
}

export interface WatchHistoryItem {
  contentId: string;
  contentType: 'movie' | 'series' | 'episode';
  watchedAt: Date;
  duration: number;
  progress: number;
  metadata?: {
    title?: string;
    season?: number;
    episode?: number;
    seriesId?: string;
  };
}

export interface EpisodeProgress {
  seriesId: string;
  seasonNumber: number;
  episodeId: string;
  progress: number;
  lastWatchedAt: Date;
  duration: number;
}

export interface UserSettings {
  autoplay: boolean;
  subtitles: boolean;
  subtitleLanguage: string;
  audioLanguage: string;
  videoQuality: 'auto' | 'low' | 'medium' | 'high';
}

export interface UserPreferences {
  _id: string;
  userId: string;
  profileId: string;
  watchlist: WatchlistItem[];
  watchHistory: WatchHistoryItem[];
  episodeProgress: EpisodeProgress[];
  settings: UserSettings;
  tasteDNA?: {
    genres: Array<{ genre: string; score: number }>;
    actors: Array<{ actor: string; score: number }>;
    directors: Array<{ director: string; score: number }>;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  // Watchlist functions
  addToWatchlist: (contentId: string, contentType: 'movie' | 'series' | 'episode', metadata?: any) => Promise<void>;
  removeFromWatchlist: (contentId: string) => Promise<void>;
  isInWatchlist: (contentId: string) => boolean;
  // Watch history functions
  addToWatchHistory: (contentId: string, contentType: 'movie' | 'series' | 'episode', duration: number, progress: number, metadata?: any) => Promise<void>;
  // Episode progress functions
  updateEpisodeProgress: (seriesId: string, seasonNumber: number, episodeId: string, progress: number, duration: number) => Promise<void>;
  getEpisodeProgress: (seriesId: string, seasonNumber: number, episodeId: string) => EpisodeProgress | null;
  // Settings functions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  // Refresh function
  refresh: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user token
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('User is browsing as guest (no token found)');
        setLoading(false);
        return; // Don't throw error, just return early
      }

      const response = await fetch('/api/user/preferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch preferences');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      
      // If authentication error, handle gracefully
      if (err instanceof Error && err.message.includes('token')) {
        console.warn('User authentication error - browsing as guest');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to watchlist
  const addToWatchlist = useCallback(async (
    contentId: string, 
    contentType: 'movie' | 'series' | 'episode', 
    metadata?: any
  ) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Cannot add to watchlist - user not authenticated');
        return;
      }

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'watchlist',
          data: {
            contentId,
            contentType,
            metadata
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add to watchlist');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  }, []);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (contentId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Cannot remove from watchlist - user not authenticated');
        return;
      }

      const response = await fetch('/api/user/preferences', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'watchlist',
          contentId
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove from watchlist');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  }, []);

  // Check if item is in watchlist
  const isInWatchlist = useCallback((contentId: string) => {
    if (!preferences) return false;
    return preferences.watchlist.some(item => item.contentId === contentId);
  }, [preferences]);

  // Add to watch history
  const addToWatchHistory = useCallback(async (
    contentId: string,
    contentType: 'movie' | 'series' | 'episode',
    duration: number,
    progress: number,
    metadata?: any
  ) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Cannot add to watch history - user not authenticated');
        return;
      }

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'watchHistory',
          data: {
            contentId,
            contentType,
            duration,
            progress,
            metadata
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add to watch history');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error adding to watch history:', err);
      throw err;
    }
  }, []);

  // Update episode progress
  const updateEpisodeProgress = useCallback(async (
    seriesId: string,
    seasonNumber: number,
    episodeId: string,
    progress: number,
    duration: number
  ) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Cannot update episode progress - user not authenticated');
        return;
      }

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'episodeProgress',
          data: {
            seriesId,
            seasonNumber,
            episodeId,
            progress,
            duration
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update episode progress');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error updating episode progress:', err);
      throw err;
    }
  }, []);

  // Get episode progress
  const getEpisodeProgress = useCallback((
    seriesId: string,
    seasonNumber: number,
    episodeId: string
  ) => {
    if (!preferences) return null;
    return preferences.episodeProgress.find(
      item => item.seriesId === seriesId && 
              item.seasonNumber === seasonNumber && 
              item.episodeId === episodeId
    ) || null;
  }, [preferences]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Cannot update settings - user not authenticated');
        return;
      }

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'settings',
          data: newSettings
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setPreferences(data.data);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, []);

  // Refresh preferences
  const refresh = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToWatchHistory,
    updateEpisodeProgress,
    getEpisodeProgress,
    updateSettings,
    refresh,
  };
}
