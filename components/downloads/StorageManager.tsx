"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Clock, 
  Film, 
  Tv, 
  Users, 
  Sparkles, 
  Zap, 
  Shield, 
  X, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useDownloads } from '@/contexts/DownloadContext';
import { DownloadItem, DownloadStatus, ContentType } from '@/types/downloads';

interface StorageManagerProps {
  compact?: boolean;
}

interface CleanupSuggestion {
  id: string;
  type: 'watched' | 'expired' | 'low_rating' | 'duplicate' | 'large_file';
  title: string;
  reason: string;
  size: string;
  priority: 'high' | 'medium' | 'low';
  items: DownloadItem[];
  spaceToFree: string;
}

interface StorageAnalytics {
  totalUsed: number;
  totalAvailable: number;
  breakdown: {
    movies: { size: number; count: number; percentage: number };
    series: { size: number; count: number; percentage: number };
    episodes: { size: number; count: number; percentage: number };
    others: { size: number; count: number; percentage: number };
  };
  trends: {
    dailyGrowth: number;
    weeklyGrowth: number;
    projectedFull: Date;
  };
  recommendations: {
    optimalQuality: string;
    suggestedCleanup: string;
    storageHealth: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

const StorageManager: React.FC<StorageManagerProps> = ({ compact = false }) => {
  const { 
    queue, 
    storage, 
    settings, 
    updateSettings, 
    cleanupStorage,
    removeFromQueue 
  } = useDownloads();

  const [expanded, setExpanded] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [cleanupSuggestions, setCleanupSuggestions] = useState<CleanupSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  // Generate cleanup suggestions based on current downloads
  const generateCleanupSuggestions = (): CleanupSuggestion[] => {
    const suggestions: CleanupSuggestion[] = [];
    const completedItems = queue.items.filter(item => item.status === 'completed');
    const expiredItems = queue.items.filter(item => item.status === 'expired');
    const lowRatingItems = queue.items.filter(item => item.rating && item.rating < 6.0);
    const largeFiles = queue.items.filter(item => parseFloat(item.size) > 3.0);

    // Watched content suggestion
    if (completedItems.length > 0) {
      const watchedSize = completedItems.reduce((total, item) => total + parseFloat(item.size), 0);
      suggestions.push({
        id: 'watched',
        type: 'watched',
        title: 'Watched Content',
        reason: 'Content you have already finished watching',
        size: `${watchedSize.toFixed(1)} GB`,
        priority: 'high',
        items: completedItems,
        spaceToFree: `${watchedSize.toFixed(1)} GB`
      });
    }

    // Expired content suggestion
    if (expiredItems.length > 0) {
      const expiredSize = expiredItems.reduce((total, item) => total + parseFloat(item.size), 0);
      suggestions.push({
        id: 'expired',
        type: 'expired',
        title: 'Expired Downloads',
        reason: 'Content that has expired and can no longer be watched',
        size: `${expiredSize.toFixed(1)} GB`,
        priority: 'high',
        items: expiredItems,
        spaceToFree: `${expiredSize.toFixed(1)} GB`
      });
    }

    // Low rating content suggestion
    if (lowRatingItems.length > 0) {
      const lowRatingSize = lowRatingItems.reduce((total, item) => total + parseFloat(item.size), 0);
      suggestions.push({
        id: 'low_rating',
        type: 'low_rating',
        title: 'Low Rated Content',
        reason: 'Content with ratings below 6.0 that you might not rewatch',
        size: `${lowRatingSize.toFixed(1)} GB`,
        priority: 'medium',
        items: lowRatingItems,
        spaceToFree: `${lowRatingSize.toFixed(1)} GB`
      });
    }

    // Large files suggestion
    if (largeFiles.length > 0) {
      const largeSize = largeFiles.reduce((total, item) => total + parseFloat(item.size), 0);
      suggestions.push({
        id: 'large_file',
        type: 'large_file',
        title: 'Large Files',
        reason: 'Files larger than 3GB taking up significant space',
        size: `${largeSize.toFixed(1)} GB`,
        priority: 'medium',
        items: largeFiles,
        spaceToFree: `${largeSize.toFixed(1)} GB`
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Generate storage analytics
  const generateAnalytics = (): StorageAnalytics => {
    const items = queue.items;
    const totalUsed = items.reduce((total, item) => total + parseFloat(item.size), 0);
    const totalAvailable = parseFloat(storage.total) - totalUsed;

    // Breakdown by content type
    const breakdown = {
      movies: { size: 0, count: 0, percentage: 0 },
      series: { size: 0, count: 0, percentage: 0 },
      episodes: { size: 0, count: 0, percentage: 0 },
      others: { size: 0, count: 0, percentage: 0 }
    };

    items.forEach(item => {
      const size = parseFloat(item.size);
      if (item.type === 'movie') {
        breakdown.movies.size += size;
        breakdown.movies.count++;
      } else if (item.type === 'series') {
        breakdown.series.size += size;
        breakdown.series.count++;
      } else if (item.type === 'episode') {
        breakdown.episodes.size += size;
        breakdown.episodes.count++;
      } else {
        breakdown.others.size += size;
        breakdown.others.count++;
      }
    });

    // Calculate percentages
    Object.values(breakdown).forEach(category => {
      category.percentage = totalUsed > 0 ? (category.size / totalUsed) * 100 : 0;
    });

    // Mock trends
    const trends = {
      dailyGrowth: 0.8, // GB per day
      weeklyGrowth: 5.6, // GB per week
      projectedFull: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
    };

    // Recommendations
    const storageHealthPercentage = totalUsed / parseFloat(storage.total);
    const storageHealth: 'excellent' | 'good' | 'warning' | 'critical' = 
      storageHealthPercentage > 0.9 ? 'critical' :
      storageHealthPercentage > 0.8 ? 'warning' :
      storageHealthPercentage > 0.6 ? 'good' : 'excellent';

    const recommendations = {
      optimalQuality: storageHealthPercentage > 0.8 ? '720p' : '1080p',
      suggestedCleanup: storage.recommendedCleanup,
      storageHealth
    };

    return {
      totalUsed,
      totalAvailable,
      breakdown,
      trends,
      recommendations
    };
  };

  useEffect(() => {
    setCleanupSuggestions(generateCleanupSuggestions());
    setAnalytics(generateAnalytics());
  }, [queue.items, storage]);

  const handleAnalyzeStorage = async () => {
    setIsAnalyzing(true);
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalytics(generateAnalytics());
    setCleanupSuggestions(generateCleanupSuggestions());
    setIsAnalyzing(false);
  };

  const handleExecuteCleanup = async () => {
    const itemsToRemove: DownloadItem[] = [];
    
    selectedSuggestions.forEach(suggestionId => {
      const suggestion = cleanupSuggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        itemsToRemove.push(...suggestion.items);
      }
    });

    // Remove items from queue
    for (const item of itemsToRemove) {
      await removeFromQueue(item.id);
    }

    const freedSpace = itemsToRemove.reduce((total, item) => total + parseFloat(item.size), 0);
    
    // Clear selection
    setSelectedSuggestions(new Set());
    
    // Show success message
    console.log(`Freed ${freedSpace.toFixed(1)} GB by removing ${itemsToRemove.length} items`);
  };

  const handleSuggestionToggle = (suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const getStorageHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStorageHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <Shield className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <HardDrive className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/40 bg-red-500/10';
      case 'medium': return 'border-yellow-500/40 bg-yellow-500/10';
      case 'low': return 'border-blue-500/40 bg-blue-500/10';
      default: return 'border-slate-500/40 bg-slate-500/10';
    }
  };

  const totalCleanupSize = Array.from(selectedSuggestions).reduce((total, suggestionId) => {
    const suggestion = cleanupSuggestions.find(s => s.id === suggestionId);
    return total + (suggestion ? parseFloat(suggestion.spaceToFree) : 0);
  }, 0);

  if (compact) {
    return (
      <div className="strong-glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">Storage Manager</h3>
              <p className="text-slate-400 text-xs">
                {storage.used} / {storage.total} used
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAnalyzeStorage}
            disabled={isAnalyzing}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Storage Manager
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
              Smart Storage Optimization
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Storage Health */}
          {analytics && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <div className={getStorageHealthColor(analytics.recommendations.storageHealth)}>
                {getStorageHealthIcon(analytics.recommendations.storageHealth)}
              </div>
              <span className={`text-xs font-black uppercase ${getStorageHealthColor(analytics.recommendations.storageHealth)}`}>
                {analytics.recommendations.storageHealth}
              </span>
            </div>
          )}
          
          {/* Analytics Toggle */}
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl hover:bg-white/5 transition-all"
          >
            <BarChart3 className="w-5 h-5 text-white" />
            <span className="text-sm font-black text-white uppercase">Analytics</span>
          </button>
          
          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeStorage}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400 text-sm font-black uppercase tracking-widest hover:bg-orange-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Storage Analytics */}
      <AnimatePresence>
        {showAnalytics && analytics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="strong-glass rounded-2xl p-6 space-y-6"
          >
            {/* Storage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {analytics.totalUsed.toFixed(1)} GB
                </div>
                <p className="text-slate-400 text-sm">Used Space</p>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(analytics.totalUsed / parseFloat(storage.total)) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {analytics.totalAvailable.toFixed(1)} GB
                </div>
                <p className="text-slate-400 text-sm">Available</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-black">
                    {analytics.recommendations.optimalQuality} recommended
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-2">
                  {analytics.trends.dailyGrowth} GB/day
                </div>
                <p className="text-slate-400 text-sm">Daily Growth</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-black">
                    Full in ~30 days
                  </span>
                </div>
              </div>
            </div>

            {/* Content Breakdown */}
            <div>
              <h3 className="text-white font-black text-lg mb-4">Content Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(analytics.breakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        {type === 'movies' && <Film className="w-4 h-4 text-white" />}
                        {type === 'series' && <Tv className="w-4 h-4 text-white" />}
                        {type === 'episodes' && <Tv className="w-4 h-4 text-white" />}
                        {type === 'others' && <Users className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-black capitalize">{type}</p>
                        <p className="text-slate-400 text-xs">
                          {data.count} items • {data.size.toFixed(1)} GB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${data.percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        />
                      </div>
                      <span className="text-white font-black text-sm">
                        {data.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cleanup Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-lg">Smart Cleanup Suggestions</h3>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              {selectedSuggestions.size} selected
            </span>
            {selectedSuggestions.size > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-orange-400 text-sm font-black">
                  {totalCleanupSize.toFixed(1)} GB
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {cleanupSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`strong-glass rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                  selectedSuggestions.has(suggestion.id) 
                    ? getPriorityColor(suggestion.priority) 
                    : 'border-transparent hover:border-white/20'
                }`}
                onClick={() => handleSuggestionToggle(suggestion.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.has(suggestion.id)}
                      onChange={() => handleSuggestionToggle(suggestion.id)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-transparent text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-black text-sm">{suggestion.title}</h4>
                        <div className={`px-2 py-1 rounded-lg text-xs font-black uppercase ${
                          suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {suggestion.priority} priority
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-2">{suggestion.reason}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Trash2 className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-400 font-black">
                            {suggestion.items.length} items
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 font-black">
                            {suggestion.spaceToFree}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-black">
                      Free Space
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cleanup Actions */}
        {selectedSuggestions.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-orange-400 font-black text-sm">
                  Ready to free up {totalCleanupSize.toFixed(1)} GB
                </p>
                <p className="text-slate-400 text-xs">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSuggestions(new Set())}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-black hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCleanup}
                className="px-4 py-2 bg-orange-500 border border-orange-500 rounded-lg text-white text-sm font-black hover:bg-orange-600 transition-colors"
              >
                Execute Cleanup
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StorageManager;
