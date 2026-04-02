"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Play, 
  Plus, 
  X, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star,
  ChevronRight,
  Brain,
  Target
} from 'lucide-react';
import { useDownloads } from '@/contexts/DownloadContext';
import { SmartRecommendation, DownloadItem } from '@/types/downloads';

interface SmartDownloadRecommendationsProps {
  maxItems?: number;
  showReason?: boolean;
  compact?: boolean;
}

const SmartDownloadRecommendations: React.FC<SmartDownloadRecommendationsProps> = ({
  maxItems = 6,
  showReason = true,
  compact = false
}) => {
  const { 
    recommendations, 
    watchPattern, 
    addToQueue, 
    network, 
    settings,
    refreshRecommendations 
  } = useDownloads();

  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Filter recommendations based on network and settings
  const filteredRecommendations = recommendations
    .filter(rec => {
      // Respect wifi-only setting
      if (settings.wifiOnly && network.type !== 'wifi') return false;
      
      // Filter by quality preference
      if (settings.downloadQuality !== 'auto' && 
          rec.content.quality !== settings.downloadQuality) return false;
      
      // Filter out already added items
      if (addedItems.has(rec.content.id)) return false;
      
      return true;
    })
    .slice(0, maxItems);

  const handleAddToQueue = async (recommendation: SmartRecommendation) => {
    try {
      const result = await addToQueue(recommendation.content);
      if (result.success) {
        setAddedItems(prev => new Set([...prev, recommendation.content.id]));
      }
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRecommendations();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="w-4 h-4 text-red-400" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Clock className="w-4 h-4 text-slate-400" />;
      default: return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatReason = (reason: string) => {
    // Capitalize first letter and add period if missing
    return reason.charAt(0).toUpperCase() + reason.slice(1) + (reason.endsWith('.') ? '' : '.');
  };

  if (filteredRecommendations.length === 0) {
    return (
      <div className="strong-glass rounded-2xl p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-white font-black text-lg mb-2">No Smart Recommendations</h3>
        <p className="text-slate-400 text-sm mb-4">
          Start watching more content to get personalized download suggestions
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-sm font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          <Sparkles className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Smart Recommendations
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
              AI-Powered Suggestions
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl hover:bg-white/5 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 text-red-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs font-black text-white uppercase tracking-widest">
            {isRefreshing ? 'Analyzing...' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Watch Pattern Insight */}
      <div className="p-4 strong-glass rounded-2xl border-l-4 border-red-500">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-white font-black text-sm mb-1">Based on your watch pattern</h4>
            <p className="text-slate-400 text-xs">
              You enjoy {watchPattern.favoriteGenres.slice(0, 3).join(', ')} • 
              Preferred quality: {watchPattern.preferredQuality} • 
              Average session: {watchPattern.averageSessionDuration}min
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className={`grid gap-4 ${
        compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="group relative"
            >
              <div className="strong-glass rounded-2xl overflow-hidden border border-transparent transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:border-red-500/30">
                
                {/* Content Poster */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recommendation.content.poster}
                    alt={recommendation.content.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  
                  {/* Priority Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {getPriorityIcon(recommendation.priority)}
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-black ${getConfidenceColor(recommendation.confidence)}`}>
                      {Math.round(recommendation.confidence * 100)}% match
                    </div>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => handleAddToQueue(recommendation)}
                      className="w-10 h-10 bg-red-500/90 rounded-xl flex items-center justify-center backdrop-blur-md hover:bg-red-500 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Content Info */}
                  <div className="absolute bottom-3 left-3 right-12">
                    <h3 className="text-white font-black text-sm uppercase italic line-clamp-1">
                      {recommendation.content.title}
                    </h3>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                      {recommendation.content.type} • {recommendation.content.quality}
                    </p>
                  </div>
                </div>
                
                {/* Recommendation Details */}
                <div className="p-4 space-y-3">
                  {/* Reason */}
                  {showReason && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">
                          Why this?
                        </span>
                        <button
                          onClick={() => setExpandedReason(
                            expandedReason === recommendation.content.id ? null : recommendation.content.id
                          )}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            expandedReason === recommendation.content.id ? 'rotate-90' : ''
                          }`} />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {expandedReason === recommendation.content.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-slate-400 text-xs leading-relaxed">
                              {formatReason(recommendation.reason)}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Content Metadata */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {recommendation.content.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-1" />
                          <span className="text-slate-400 font-black">
                            {recommendation.content.rating}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400 font-black">
                          {recommendation.content.duration}min
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-slate-500 font-black">
                      {recommendation.content.size}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleAddToQueue(recommendation)}
                    className="w-full py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Network Warning */}
      {settings.wifiOnly && network.type !== 'wifi' && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-black">
                WiFi Only Mode
              </p>
              <p className="text-slate-400 text-xs">
                Connect to WiFi to enable smart downloads
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDownloadRecommendations;
