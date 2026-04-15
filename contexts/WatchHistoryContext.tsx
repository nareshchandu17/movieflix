"use client";
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

interface WatchHistoryItem {
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

interface WatchHistoryContextType {
  // Data
  continueWatching: WatchHistoryItem[];
  watchHistory: WatchHistoryItem[];
  loading: boolean;
  
  // Actions
  updateProgress: (contentId: string, progress: number, duration: number, contentType?: string) => Promise<void>;
  getProgress: (contentId: string) => Promise<WatchHistoryItem | null>;
  clearHistory: (contentId?: string, olderThan?: number) => Promise<void>;
  refreshHistory: () => Promise<void>;
  
  // Stats
  totalWatchTime: number;
  completedCount: number;
  inProgressCount: number;
}

const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(undefined);

export function WatchHistoryProvider({ children }: { children: ReactNode }) {
  // Mock profile since authentication is removed - using valid ObjectId format
  const mockProfile = { id: '507f1f77bcf86cd799439011', name: 'Demo User' };
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    // Only fetch if it's been more than 5 seconds since last fetch to prevent infinite loops
    const now = Date.now();
    if (mockProfile && now - lastFetchTime > 5000) {
      fetchWatchHistory();
      setLastFetchTime(now);
    } else if (!mockProfile) {
      setContinueWatching([]);
      setWatchHistory([]);
      setLoading(false);
    }
  }, [mockProfile, lastFetchTime]);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch continue watching
      try {
        const continueResponse = await fetch('/api/history/continue?limit=20');
        if (continueResponse.ok) {
          const continueData = await continueResponse.json();
          if (continueData.success) {
            setContinueWatching(continueData.data || []);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch continue watching:', error);
        setContinueWatching([]);
      }

      // Fetch complete history
      try {
        const historyResponse = await fetch('/api/history/all?limit=50');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.success) {
            setWatchHistory(historyData.data || []);
            setTotalWatchTime(historyData.stats?.totalWatchTime || 0);
            setCompletedCount(historyData.stats?.completedCount || 0);
            setInProgressCount(historyData.stats?.inProgressCount || 0);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch complete history:', error);
        setWatchHistory([]);
        setTotalWatchTime(0);
        setCompletedCount(0);
        setInProgressCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
      // Set default values on error
      setContinueWatching([]);
      setWatchHistory([]);
      setTotalWatchTime(0);
      setCompletedCount(0);
      setInProgressCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Simple debounce timeout to prevent excessive API calls
  let fetchTimeout: NodeJS.Timeout | null = null;

  const debouncedFetchHistory = () => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
    }
    fetchTimeout = setTimeout(() => {
      fetchWatchHistory();
    }, 1000); // 1 second debounce
  };

  const updateProgress = async (
    contentId: string, 
    progress: number, 
    duration: number, 
    contentType: string = 'movie'
  ) => {
    if (!mockProfile) return;

    try {
      const response = await fetch('/api/history/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentId,
          progress,
          duration,
          contentType,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          device: 'web',
          quality: 'auto'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Use debounced fetch to prevent excessive API calls
          debouncedFetchHistory();
        }
      } else {
        console.warn('Failed to update progress:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to update progress:', error);
    }
  };

  const getProgress = async (contentId: string): Promise<WatchHistoryItem | null> => {
    if (!mockProfile) return null;

    try {
      const response = await fetch(`/api/history/progress?contentId=${contentId}`);
      if (!response.ok) return null;
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  };

  const clearHistory = async (contentId?: string, olderThan?: number) => {
    if (!mockProfile) return;

    try {
      const params = new URLSearchParams();
      if (contentId) params.append('contentId', contentId);
      if (olderThan) params.append('olderThan', olderThan.toString());

      const response = await fetch(`/api/history/all?${params}`, {
        method: 'DELETE'
      });

      if (!response.ok) return;
      const data = await response.json();
      
      if (data.success) {
        // Use debounced fetch to prevent excessive API calls
        debouncedFetchHistory();
        return data.deletedCount;
      }
    } catch (error) {
      console.warn('Failed to clear history:', error);
    }
  };

  const refreshHistory = async () => {
    debouncedFetchHistory();
  };

  // Helper functions
  const formatTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatWatchTime = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0 minutes';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const value: WatchHistoryContextType = {
    continueWatching,
    watchHistory,
    loading,
    updateProgress,
    getProgress,
    clearHistory,
    refreshHistory,
    totalWatchTime,
    completedCount,
    inProgressCount
  };

  return (
    <WatchHistoryContext.Provider value={value}>
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  const context = useContext(WatchHistoryContext);
  if (context === undefined) {
    throw new Error('useWatchHistory must be used within a WatchHistoryProvider');
  }
  return context;
}

export default WatchHistoryContext;
