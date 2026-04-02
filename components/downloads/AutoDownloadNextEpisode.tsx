"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Tv, 
  Film,
  Wifi,
  WifiOff,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useDownloads } from '@/contexts/DownloadContext';
import { DownloadItem, DownloadStatus } from '@/types/downloads';

interface AutoDownloadNextEpisodeProps {
  compact?: boolean;
}

interface SeriesProgress {
  seriesId: string;
  title: string;
  currentSeason: number;
  currentEpisode: number;
  totalSeasons: number;
  totalEpisodes: number;
  nextEpisode: {
    season: number;
    episode: number;
    title: string;
    available: boolean;
  };
  autoEnabled: boolean;
}

const AutoDownloadNextEpisode: React.FC<AutoDownloadNextEpisodeProps> = ({ compact = false }) => {
  const { 
    queue, 
    network, 
    settings, 
    updateSettings, 
    addToQueue,
    removeFromQueue 
  } = useDownloads();

  const [expanded, setExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [seriesProgress, setSeriesProgress] = useState<SeriesProgress[]>([]);

  // Mock series progress data - in real app, this would come from watch history
  const mockSeriesProgress: SeriesProgress[] = [
    {
      seriesId: 'breaking-bad',
      title: 'Breaking Bad',
      currentSeason: 3,
      currentEpisode: 5,
      totalSeasons: 5,
      totalEpisodes: 62,
      nextEpisode: {
        season: 3,
        episode: 6,
        title: 'Half Measures',
        available: true
      },
      autoEnabled: true
    },
    {
      seriesId: 'stranger-things',
      title: 'Stranger Things',
      currentSeason: 4,
      currentEpisode: 7,
      totalSeasons: 4,
      totalEpisodes: 42,
      nextEpisode: {
        season: 4,
        episode: 8,
        title: 'Chapter Eight: Papa',
        available: true
      },
      autoEnabled: true
    },
    {
      seriesId: 'the-crown',
      title: 'The Crown',
      currentSeason: 2,
      currentEpisode: 10,
      totalSeasons: 4,
      totalEpisodes: 40,
      nextEpisode: {
        season: 3,
        episode: 1,
        title: 'Olding',
        available: false // Not released yet
      },
      autoEnabled: false
    }
  ];

  useEffect(() => {
    setSeriesProgress(mockSeriesProgress);
  }, []);

  const handleToggleAutoDownload = async (seriesId: string) => {
    const updatedProgress = seriesProgress.map(series => 
      series.seriesId === seriesId 
        ? { ...series, autoEnabled: !series.autoEnabled }
        : series
    );
    setSeriesProgress(updatedProgress);

    // Show notification
    const series = updatedProgress.find(s => s.seriesId === seriesId);
    if (series) {
      setNotificationMessage(
        `Auto-download ${series.autoEnabled ? 'enabled' : 'disabled'} for ${series.title}`
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDownloadNextEpisode = async (series: SeriesProgress) => {
    if (!series.nextEpisode.available || network.type === 'cellular' && settings.wifiOnly) {
      setNotificationMessage('Next episode not available or WiFi-only mode enabled');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    // Create mock download item for next episode
    const nextEpisodeItem: DownloadItem = {
      id: `${series.seriesId}-s${series.nextEpisode.season}-e${series.nextEpisode.episode}`,
      title: `${series.title} - S${series.nextEpisode.season}E${series.nextEpisode.episode}`,
      type: 'episode',
      poster: `https://example.com/${series.seriesId}-s${series.nextEpisode.season}-e${series.nextEpisode.episode}.jpg`,
      status: 'queued',
      progress: 0,
      quality: settings.downloadQuality,
      size: '1.2 GB',
      downloadedSize: '0 GB',
      priority: 2,
      addedAt: new Date(),
      duration: 55,
      seriesId: series.seriesId,
      season: series.nextEpisode.season,
      episode: series.nextEpisode.episode,
      autoDownloaded: true
    };

    try {
      const result = await addToQueue(nextEpisodeItem);
      if (result.success) {
        setNotificationMessage(`Next episode of ${series.title} added to queue`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('Failed to add next episode to queue:', error);
    }
  };

  const handleToggleGlobalSetting = async () => {
    await updateSettings({ autoDownloadNextEpisode: !settings.autoDownloadNextEpisode });
    
    setNotificationMessage(
      `Auto-download next episode ${!settings.autoDownloadNextEpisode ? 'enabled' : 'disabled'}`
    );
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const activeSeries = seriesProgress.filter(series => series.autoEnabled);
  const hasNetworkAccess = network.type === 'wifi' || !settings.wifiOnly;

  if (compact) {
    return (
      <div className="strong-glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm">Auto Download Next Episode</h3>
              <p className="text-slate-400 text-xs">
                {activeSeries.length} series active
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleGlobalSetting}
            className="flex items-center gap-2"
          >
            {settings.autoDownloadNextEpisode ? (
              <ToggleRight className="w-8 h-8 text-green-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
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
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Auto Download Next Episode
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
              Smart Episode Management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Network Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            {hasNetworkAccess ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-xs font-black text-white">
              {hasNetworkAccess ? 'Ready' : 'Limited'}
            </span>
          </div>
          
          {/* Global Toggle */}
          <button
            onClick={handleToggleGlobalSetting}
            className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl hover:bg-white/5 transition-all"
          >
            <span className="text-sm font-black text-white uppercase">Global</span>
            {settings.autoDownloadNextEpisode ? (
              <ToggleRight className="w-6 h-6 text-green-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-white font-black text-sm mb-1">How it works</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              When you finish watching an episode, the next one will automatically download in the background. 
              Only works on WiFi and respects your storage limits.
            </p>
          </div>
        </div>
      </div>

      {/* Series List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-black text-lg">Active Series</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {seriesProgress.map((series, index) => (
            <motion.div
              key={series.seriesId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="strong-glass rounded-2xl p-4 border border-transparent hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Series Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-black text-sm">{series.title}</h4>
                      <div className={`w-2 h-2 rounded-full ${
                        series.autoEnabled ? 'bg-green-400' : 'bg-slate-400'
                      }`} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="font-black uppercase tracking-widest">
                        S{series.currentSeason}E{series.currentEpisode}
                      </span>
                      <span>→</span>
                      <span className={`font-black uppercase tracking-widest ${
                        series.nextEpisode.available ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {series.nextEpisode.available 
                          ? `S${series.nextEpisode.season}E${series.nextEpisode.episode}`
                          : 'Not Available'
                        }
                      </span>
                      <span>•</span>
                      <span className="font-black uppercase tracking-widest">
                        {series.currentEpisode}/{series.totalEpisodes} watched
                      </span>
                    </div>
                    
                    {series.nextEpisode.available && (
                      <p className="text-slate-500 text-xs mt-1">
                        Next: {series.nextEpisode.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Download Next Button */}
                  {series.autoEnabled && series.nextEpisode.available && hasNetworkAccess && (
                    <button
                      onClick={() => handleDownloadNextEpisode(series)}
                      className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Download Next
                    </button>
                  )}
                  
                  {/* Individual Toggle */}
                  <button
                    onClick={() => handleToggleAutoDownload(series.seriesId)}
                    className="flex items-center gap-2"
                  >
                    {series.autoEnabled ? (
                      <ToggleRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-black uppercase tracking-widest">Series Progress</span>
                  <span className="text-white font-black">
                    {Math.round((series.currentEpisode / series.totalEpisodes) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(series.currentEpisode / series.totalEpisodes) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Status Messages */}
              {!series.nextEpisode.available && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-black">
                      Next episode not yet available
                    </span>
                  </div>
                </div>
              )}
              
              {!hasNetworkAccess && series.autoEnabled && (
                <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 text-xs font-black">
                      Waiting for WiFi connection
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className="strong-glass rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-white text-sm font-black">{notificationMessage}</p>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoDownloadNextEpisode;
