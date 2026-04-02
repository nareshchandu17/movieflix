"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  DownloadContextType, 
  DownloadQueue, 
  StorageInfo, 
  NetworkInfo, 
  DownloadSettings, 
  DownloadStats, 
  SmartRecommendation, 
  WatchPattern,
  DownloadItem,
  DownloadStatus,
  TravelModeConfig
} from '@/types/downloads';

// Separate state interface for reducer
interface DownloadState {
  queue: DownloadQueue;
  storage: StorageInfo;
  network: NetworkInfo;
  settings: DownloadSettings;
  stats: DownloadStats;
  recommendations: SmartRecommendation[];
  watchPattern: WatchPattern;
}

// Initial State definitions
const initialQueue: DownloadQueue = {
  id: 'main-queue',
  items: [],
  maxConcurrentDownloads: 3,
  currentDownloads: 0,
  paused: false,
  totalSize: '0 GB',
  downloadedSize: '0 GB'
};

const initialStorage: StorageInfo = {
  total: '64 GB',
  used: '32.4 GB',
  available: '31.6 GB',
  breakdown: {
    movies: '8.2 GB',
    series: '12.5 GB',
    kids: '3.1 GB',
    others: '8.6 GB'
  },
  needsCleanup: false,
  recommendedCleanup: '2.3 GB'
};

const initialNetwork: NetworkInfo = {
  type: 'wifi',
  quality: 'excellent',
  speed: 150,
  isUnlimited: true,
  recommendedQuality: '1080p'
};

const initialSettings: DownloadSettings = {
  smartDownloads: true,
  autoDownloadNextEpisode: true,
  downloadQuality: 'auto',
  wifiOnly: true,
  maxStorageUsage: 80,
  deleteWatchedContent: true,
  deleteExpiredContent: true,
  travelMode: {
    enabled: false,
    estimatedOfflineHours: 0,
    preferences: {
      onlyWatchedSeries: false,
      includeMovies: true,
      maxContentHours: 24,
      qualityPreference: '1080p',
      genres: []
    }
  }
};

const initialStats: DownloadStats = {
  totalDownloads: 0,
  completedDownloads: 0,
  failedDownloads: 0,
  totalDownloadedSize: '0 GB',
  averageDownloadSpeed: '0 MB/s',
  mostDownloadedGenre: 'Drama',
  downloadStreak: 0
};

const initialWatchPattern: WatchPattern = {
  userId: 'current-user',
  recentlyWatched: [],
  favoriteGenres: ['Drama', 'Crime', 'Thriller'],
  preferredQuality: '1080p',
  watchTimePreference: 'evening',
  averageSessionDuration: 45,
  seriesCompletionRate: 0.85
};

// Combined Initial State
const initialState: DownloadState = {
  queue: initialQueue,
  storage: initialStorage,
  network: initialNetwork,
  settings: initialSettings,
  stats: initialStats,
  recommendations: [],
  watchPattern: initialWatchPattern
};

// Action Types
type DownloadAction = 
  | { type: 'ADD_TO_QUEUE'; payload: DownloadItem }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'UPDATE_DOWNLOAD_STATUS'; payload: { id: string; status: DownloadStatus; progress?: number } }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; progress: number; speed?: string; timeRemaining?: string } }
  | { type: 'SET_QUEUE_PAUSED'; payload: boolean }
  | { type: 'UPDATE_STORAGE'; payload: StorageInfo }
  | { type: 'UPDATE_NETWORK'; payload: NetworkInfo }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<DownloadSettings> }
  | { type: 'UPDATE_STATS'; payload: DownloadStats }
  | { type: 'SET_RECOMMENDATIONS'; payload: SmartRecommendation[] }
  | { type: 'UPDATE_WATCH_PATTERN'; payload: WatchPattern }
  | { type: 'REORDER_QUEUE'; payload: DownloadItem[] }
  | { type: 'CLEAR_COMPLETED' };

// Reducer
const downloadReducer = (state: DownloadState, action: DownloadAction): DownloadState => {
  switch (action.type) {
    case 'ADD_TO_QUEUE':
      const newQueue = { ...state.queue };
      newQueue.items = [...newQueue.items, action.payload].sort((a, b) => b.priority - a.priority);
      newQueue.totalSize = calculateTotalSize(newQueue.items);
      return { ...state, queue: newQueue };

    case 'REMOVE_FROM_QUEUE':
      const filteredQueue = { ...state.queue };
      filteredQueue.items = filteredQueue.items.filter(item => item.id !== action.payload);
      filteredQueue.totalSize = calculateTotalSize(filteredQueue.items);
      return { ...state, queue: filteredQueue };

    case 'UPDATE_DOWNLOAD_STATUS':
      const statusUpdatedQueue = { ...state.queue };
      statusUpdatedQueue.items = statusUpdatedQueue.items.map(item =>
        item.id === action.payload.id 
          ? { ...item, status: action.payload.status, ...(action.payload.progress && { progress: action.payload.progress }) }
          : item
      );
      return { ...state, queue: statusUpdatedQueue };

    case 'UPDATE_PROGRESS':
      const progressUpdatedQueue = { ...state.queue };
      progressUpdatedQueue.items = progressUpdatedQueue.items.map(item =>
        item.id === action.payload.id 
          ? { 
              ...item, 
              progress: action.payload.progress,
              ...(action.payload.speed && { downloadSpeed: action.payload.speed }),
              ...(action.payload.timeRemaining && { timeRemaining: action.payload.timeRemaining })
            }
          : item
      );
      return { ...state, queue: progressUpdatedQueue };

    case 'SET_QUEUE_PAUSED':
      return { ...state, queue: { ...state.queue, paused: action.payload } };

    case 'UPDATE_STORAGE':
      return { ...state, storage: action.payload };

    case 'UPDATE_NETWORK':
      return { ...state, network: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };

    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };

    case 'UPDATE_WATCH_PATTERN':
      return { ...state, watchPattern: action.payload };

    case 'REORDER_QUEUE':
      const reorderedQueue = { ...state.queue };
      reorderedQueue.items = action.payload;
      return { ...state, queue: reorderedQueue };

    case 'CLEAR_COMPLETED':
      const clearedQueue = { ...state.queue };
      clearedQueue.items = clearedQueue.items.filter(item => item.status !== 'completed');
      clearedQueue.totalSize = calculateTotalSize(clearedQueue.items);
      return { ...state, queue: clearedQueue };

    default:
      return state;
  }
};

// Helper Functions
const calculateTotalSize = (items: DownloadItem[]): string => {
  const totalGB = items.reduce((total, item) => {
    const size = parseFloat(item.size);
    return total + (isNaN(size) ? 0 : size);
  }, 0);
  return `${totalGB.toFixed(1)} GB`;
};

// Mock API Functions (in real app, these would be actual API calls)
const mockAPI = {
  addToQueue: async (item: DownloadItem): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.1; // 90% success rate
  },
  
  removeFromQueue: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  },
  
  pauseDownload: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  },
  
  resumeDownload: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  },
  
  getRecommendations: async (watchPattern: WatchPattern): Promise<SmartRecommendation[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock recommendations based on watch pattern
    const mockRecommendations: SmartRecommendation[] = [
      {
        content: {
          id: 'rec-1',
          title: 'Better Call Saul',
          type: 'series',
          poster: 'https://example.com/poster1.jpg',
          status: 'idle',
          progress: 0,
          quality: '1080p',
          size: '2.1 GB',
          downloadedSize: '0 GB',
          priority: 1,
          addedAt: new Date(),
          duration: 45,
          rating: 9.5,
          genre: ['Crime', 'Drama'],
          year: 2015,
          isSmartRecommendation: true,
          recommendationReason: 'Because you watched Breaking Bad'
        },
        reason: 'Because you watched Breaking Bad',
        confidence: 0.95,
        priority: 'high'
      }
    ];
    
    return mockRecommendations;
  }
};

// Context Provider
const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(downloadReducer, initialState);

  // Simulate real-time progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      state.queue.items.forEach(item => {
        if (item.status === 'downloading' && item.progress < 100) {
          const progressIncrement = Math.random() * 5; // 0-5% increment
          const newProgress = Math.min(item.progress + progressIncrement, 100);
          const speed = (Math.random() * 10 + 2).toFixed(1); // 2-12 MB/s
          const remainingMB = ((100 - newProgress) / 100) * parseFloat(item.size) * 1024;
          const remainingMinutes = Math.ceil(remainingMB / parseFloat(speed));
          const timeRemaining = remainingMinutes < 60 
            ? `${remainingMinutes}m left` 
            : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m left`;

          dispatch({
            type: 'UPDATE_PROGRESS',
            payload: {
              id: item.id,
              progress: newProgress,
              speed: `${speed} MB/s`,
              timeRemaining
            }
          });

          // Mark as completed if progress reaches 100%
          if (newProgress >= 100) {
            dispatch({
              type: 'UPDATE_DOWNLOAD_STATUS',
              payload: { id: item.id, status: 'completed', progress: 100 }
            });
          }
        }
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [state.queue.items]);

  // Simulate episode completion and auto-download next episode
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for completed episodes and auto-download next ones
      if (state.settings.autoDownloadNextEpisode) {
        state.queue.items.forEach(item => {
          if (item.status === 'completed' && item.type === 'episode' && !item.autoDownloaded) {
            // Mock auto-download next episode logic
            const nextEpisode = generateNextEpisode(item);
            if (nextEpisode && (state.network.type === 'wifi' || !state.settings.wifiOnly)) {
              addToQueue(nextEpisode);
            }
          }
        });
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [state.settings.autoDownloadNextEpisode, state.queue.items, state.network, state.settings.wifiOnly]);

  // Helper function to generate next episode (mock implementation)
  const generateNextEpisode = (completedEpisode: DownloadItem): DownloadItem | null => {
    if (!completedEpisode.seriesId || !completedEpisode.season || !completedEpisode.episode) {
      return null;
    }

    const nextEpisode = completedEpisode.episode + 1;
    const nextSeason = completedEpisode.season + (nextEpisode > 10 ? 1 : 0);
    const adjustedEpisode = nextEpisode > 10 ? 1 : nextEpisode;

    return {
      id: `${completedEpisode.seriesId}-s${nextSeason}-e${adjustedEpisode}`,
      title: `${completedEpisode.title} - S${nextSeason}E${adjustedEpisode}`,
      type: 'episode',
      poster: completedEpisode.poster, // Would use actual next episode poster
      status: 'queued',
      progress: 0,
      quality: state.settings.downloadQuality,
      size: '1.2 GB',
      downloadedSize: '0 GB',
      priority: 2,
      addedAt: new Date(),
      duration: completedEpisode.duration,
      seriesId: completedEpisode.seriesId,
      season: nextSeason,
      episode: adjustedEpisode,
      autoDownloaded: true
    };
  };

  // Actions
  const addToQueue = useCallback(async (content: DownloadItem) => {
    try {
      const success = await mockAPI.addToQueue(content);
      if (success) {
        dispatch({ type: 'ADD_TO_QUEUE', payload: content });
        return { success: true, data: content };
      }
      return { success: false, error: 'Failed to add to queue' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const removeFromQueue = useCallback(async (id: string) => {
    try {
      const success = await mockAPI.removeFromQueue(id);
      if (success) {
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const pauseDownload = useCallback(async (id: string) => {
    try {
      const success = await mockAPI.pauseDownload(id);
      if (success) {
        dispatch({ type: 'UPDATE_DOWNLOAD_STATUS', payload: { id, status: 'paused' } });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const resumeDownload = useCallback(async (id: string) => {
    try {
      const success = await mockAPI.resumeDownload(id);
      if (success) {
        dispatch({ type: 'UPDATE_DOWNLOAD_STATUS', payload: { id, status: 'downloading' } });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const prioritizeDownload = useCallback(async (id: string, priority: number) => {
    // Reorder queue based on priority
    const reorderedItems = state.queue.items.map(item => 
      item.id === id ? { ...item, priority } : item
    ).sort((a, b) => b.priority - a.priority);
    
    dispatch({ type: 'REORDER_QUEUE', payload: reorderedItems });
    return true;
  }, [state.queue.items]);

  const clearCompleted = useCallback(async () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
    return true;
  }, []);

  const cleanupStorage = useCallback(async () => {
    // Mock cleanup - remove some completed items
    const completedItems = state.queue.items.filter(item => item.status === 'completed');
    const cleanupSize = (completedItems.length * 0.5).toFixed(1); // Mock 500MB per item
    
    // Remove oldest completed items
    const itemsToRemove = completedItems.slice(0, Math.floor(completedItems.length / 2));
    itemsToRemove.forEach(item => {
      dispatch({ type: 'REMOVE_FROM_QUEUE', payload: item.id });
    });

    return `Freed ${cleanupSize} GB by removing watched content`;
  }, [state.queue.items]);

  const updateSettings = useCallback(async (newSettings: Partial<DownloadSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    return true;
  }, []);

  const refreshRecommendations = useCallback(async () => {
    try {
      const recommendations = await mockAPI.getRecommendations(state.watchPattern);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  }, [state.watchPattern]);

  const activateTravelMode = useCallback(async (config: TravelModeConfig) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { travelMode: config } });
    
    // In real app, this would trigger smart downloads based on travel config
    console.log('Travel mode activated with config:', config);
    return true;
  }, []);

  const contextValue: DownloadContextType = {
    ...state,
    addToQueue,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    prioritizeDownload,
    clearCompleted,
    cleanupStorage,
    updateSettings,
    refreshRecommendations,
    activateTravelMode
  };

  return (
    <DownloadContext.Provider value={contextValue}>
      {children}
    </DownloadContext.Provider>
  );
};

// Hook
export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownloads must be used within a DownloadProvider');
  }
  return context;
};
