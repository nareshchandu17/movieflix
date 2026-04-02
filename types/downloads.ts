// Smart Adaptive Download System - Core Types

export type DownloadStatus = 'idle' | 'queued' | 'preparing' | 'downloading' | 'paused' | 'completed' | 'expired' | 'failed';

export type ContentType = 'movie' | 'series' | 'episode' | 'documentary' | 'special';

export type Quality = 'auto' | '4k' | '1080p' | '720p' | '480p';

export type NetworkType = 'wifi' | 'cellular' | 'ethernet' | 'unknown';

export interface DownloadItem {
  id: string;
  title: string;
  type: ContentType;
  poster: string;
  backdrop?: string;
  status: DownloadStatus;
  progress: number;
  quality: Quality;
  size: string; // in GB
  downloadedSize: string; // in GB
  downloadSpeed?: string; // MB/s
  timeRemaining?: string;
  priority: number;
  addedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  
  // Series specific
  seriesId?: string;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  episodesDownloaded?: number;
  
  // Metadata
  duration: number; // in minutes
  rating?: number;
  genre?: string[];
  year?: number;
  
  // Smart features
  isSmartRecommendation?: boolean;
  recommendationReason?: string;
  autoDownloaded?: boolean;
}

export interface DownloadQueue {
  id: string;
  items: DownloadItem[];
  maxConcurrentDownloads: number;
  currentDownloads: number;
  paused: boolean;
  totalSize: string;
  downloadedSize: string;
}

export interface StorageInfo {
  total: string; // GB
  used: string; // GB
  available: string; // GB
  breakdown: {
    movies: string;
    series: string;
    kids: string;
    others: string;
  };
  needsCleanup: boolean;
  recommendedCleanup: string; // GB
}

export interface NetworkInfo {
  type: NetworkType;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  speed: number; // Mbps
  isUnlimited: boolean;
  recommendedQuality: Quality;
}

export interface WatchPattern {
  userId: string;
  recentlyWatched: Array<{
    contentId: string;
    title: string;
    type: ContentType;
    watchedAt: Date;
    completionRate: number;
    rating?: number;
  }>;
  favoriteGenres: string[];
  preferredQuality: Quality;
  watchTimePreference: 'morning' | 'afternoon' | 'evening' | 'night';
  averageSessionDuration: number; // minutes
  seriesCompletionRate: number;
}

export interface SmartRecommendation {
  content: DownloadItem;
  reason: string;
  confidence: number; // 0-1
  priority: 'high' | 'medium' | 'low';
}

export interface TravelModeConfig {
  enabled: boolean;
  destination?: string;
  departureDate?: Date;
  returnDate?: Date;
  estimatedOfflineHours: number;
  preferences: {
    onlyWatchedSeries: boolean;
    includeMovies: boolean;
    maxContentHours: number;
    qualityPreference: Quality;
    genres: string[];
  };
}

export interface DownloadSettings {
  smartDownloads: boolean;
  autoDownloadNextEpisode: boolean;
  downloadQuality: Quality;
  wifiOnly: boolean;
  maxStorageUsage: number; // percentage
  deleteWatchedContent: boolean;
  deleteExpiredContent: boolean;
  travelMode: TravelModeConfig;
}

export interface DownloadStats {
  totalDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
  totalDownloadedSize: string;
  averageDownloadSpeed: string;
  mostDownloadedGenre: string;
  downloadStreak: number; // days
}

// API Response Types
export interface DownloadResponse {
  success: boolean;
  data?: DownloadItem;
  error?: string;
  message?: string;
}

export interface QueueResponse {
  success: boolean;
  data?: DownloadQueue;
  error?: string;
}

export interface RecommendationsResponse {
  success: boolean;
  data?: SmartRecommendation[];
  error?: string;
}

// Component Props Types
export interface DownloadCardProps {
  item: DownloadItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRemove: (id: string) => void;
  onPriorityChange: (id: string, priority: number) => void;
  showExpanded?: boolean;
  onExpand?: (id: string) => void;
}

export interface ProgressBarProps {
  progress: number;
  status: DownloadStatus;
  speed?: string;
  timeRemaining?: string;
  showDetails?: boolean;
  animated?: boolean;
}

export interface StorageBarProps {
  storage: StorageInfo;
  onCleanup?: () => void;
  showBreakdown?: boolean;
}

export interface TravelModePanelProps {
  config: TravelModeConfig;
  onConfigChange: (config: TravelModeConfig) => void;
  onActivate: () => void;
  recommendations?: SmartRecommendation[];
}

// Context Types
export interface DownloadContextType {
  queue: DownloadQueue;
  storage: StorageInfo;
  network: NetworkInfo;
  settings: DownloadSettings;
  stats: DownloadStats;
  recommendations: SmartRecommendation[];
  watchPattern: WatchPattern;
  
  // Actions
  addToQueue: (content: DownloadItem) => Promise<DownloadResponse>;
  removeFromQueue: (id: string) => Promise<boolean>;
  pauseDownload: (id: string) => Promise<boolean>;
  resumeDownload: (id: string) => Promise<boolean>;
  prioritizeDownload: (id: string, priority: number) => Promise<boolean>;
  clearCompleted: () => Promise<boolean>;
  cleanupStorage: () => Promise<string>;
  updateSettings: (settings: Partial<DownloadSettings>) => Promise<boolean>;
  refreshRecommendations: () => Promise<void>;
  activateTravelMode: (config: TravelModeConfig) => Promise<boolean>;
}
