"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  Star,
  Film,
  Tv,
  Calendar,
  Settings,
  MoreVertical
} from 'lucide-react';
import { DownloadCardProps, DownloadStatus, ContentType } from '@/types/downloads';

const DownloadCard: React.FC<DownloadCardProps> = ({
  item,
  onPause,
  onResume,
  onRemove,
  onPriorityChange,
  showExpanded = false,
  onExpand
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  const [showActions, setShowActions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getStatusColor = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return 'text-red-400';
      case 'completed': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'failed': return 'text-red-500';
      case 'queued': return 'text-blue-400';
      case 'expired': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return <Download className="w-4 h-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'expired': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return 'Downloading';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      case 'failed': return 'Failed';
      case 'queued': return 'Queued';
      case 'expired': return 'Expired';
      default: return 'Idle';
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'movie': return <Film className="w-4 h-4" />;
      case 'series': return <Tv className="w-4 h-4" />;
      case 'episode': return <Tv className="w-4 h-4" />;
      case 'documentary': return <Film className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  const handleAction = async (action: () => void) => {
    setShowActions(false);
    await action();
  };

  const getProgressColor = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'queued': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const isCompleted = item.status === 'completed';
  const isDownloading = item.status === 'downloading';
  const isPaused = item.status === 'paused';
  const canPause = isDownloading;
  const canResume = isPaused;
  const canRemove = !isDownloading;

  return (
    <motion.div
      className={`group relative strong-glass rounded-2xl overflow-hidden border border-transparent transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:border-red-500/30 ${
        isDragging ? 'scale-95 opacity-50' : ''
      }`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      drag={!isDownloading}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Main Content */}
      <div className="flex gap-4 p-4">
        {/* Poster */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-16 rounded-lg overflow-hidden">
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Status Badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <div className={getStatusColor(item.status)}>
              {getStatusIcon(item.status)}
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-black text-sm uppercase italic line-clamp-1 mb-1">
                {item.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  {getTypeIcon(item.type)}
                  <span className="font-black uppercase tracking-widest">
                    {item.type}
                  </span>
                </div>
                
                {item.quality && (
                  <>
                    <span>•</span>
                    <span className="font-black uppercase tracking-widest">
                      {item.quality}
                    </span>
                  </>
                )}
                
                {item.duration && (
                  <>
                    <span>•</span>
                    <span className="font-black uppercase tracking-widest">
                      {item.duration}min
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {canPause && (
                <button
                  onClick={() => handleAction(() => onPause(item.id))}
                  className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
                >
                  <Pause className="w-4 h-4 text-yellow-400" />
                </button>
              )}
              
              {canResume && (
                <button
                  onClick={() => handleAction(() => onResume(item.id))}
                  className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors"
                >
                  <Play className="w-4 h-4 text-green-400" />
                </button>
              )}
              
              {isCompleted && (
                <button
                  className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors"
                >
                  <Play className="w-4 h-4 text-green-400" />
                </button>
              )}
              
              {canRemove && (
                <button
                  onClick={() => handleAction(() => onRemove(item.id))}
                  className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
              
              <button
                onClick={() => setShowActions(!showActions)}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
                
                {isDownloading && item.downloadSpeed && (
                  <>
                    <span>•</span>
                    <span className="font-black uppercase tracking-widest text-slate-400">
                      {item.downloadSpeed}
                    </span>
                  </>
                )}
                
                {item.timeRemaining && (
                  <>
                    <span>•</span>
                    <span className="font-black uppercase tracking-widest text-slate-400">
                      {item.timeRemaining}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-400">
                  {item.downloadedSize} / {item.size}
                </span>
                <span className="font-black text-white">
                  {Math.round(item.progress)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getProgressColor(item.status)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              
              {isDownloading && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>
          </div>

          {/* Series Info */}
          {item.seriesId && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/10">
              <span className="font-black uppercase tracking-widest">
                S{item.season} E{item.episode}
              </span>
              
              {item.episodesDownloaded && item.totalEpisodes && (
                <>
                  <span>•</span>
                  <span className="font-black uppercase tracking-widest">
                    {item.episodesDownloaded}/{item.totalEpisodes} downloaded
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {onExpand && (
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onExpand(item.id);
          }}
          className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-white" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white" />
          )}
        </button>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {item.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-1" />
                    <span className="text-slate-400">Rating:</span>
                    <span className="text-white font-black">{item.rating}</span>
                  </div>
                )}
                
                {item.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">Year:</span>
                    <span className="text-white font-black">{item.year}</span>
                  </div>
                )}
                
                {item.genre && item.genre.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-slate-400">Genres:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.genre.map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/10 rounded text-white font-black text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400 text-xs">Priority:</span>
                  <select
                    value={item.priority}
                    onChange={(e) => onPriorityChange(item.id, parseInt(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs font-black"
                  >
                    <option value={1}>High</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">Network:</span>
                  <span className="text-white font-black">Auto</span>
                </div>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(() => onRemove(item.id))}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/30 transition-colors"
                >
                  Remove Download
                </button>
                
                {isPaused && (
                  <button
                    onClick={() => handleAction(() => onResume(item.id))}
                    className="flex-1 py-2 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 text-xs font-black uppercase tracking-widest hover:bg-green-500/30 transition-colors"
                  >
                    Resume
                  </button>
                )}
                
                {canPause && (
                  <button
                    onClick={() => handleAction(() => onPause(item.id))}
                    className="flex-1 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/30 transition-colors"
                  >
                    Pause
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full right-4 mt-2 w-48 strong-glass rounded-xl border border-white/20 z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {canPause && (
                <button
                  onClick={() => handleAction(() => onPause(item.id))}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Pause className="w-4 h-4 text-yellow-400" />
                  Pause Download
                </button>
              )}
              
              {canResume && (
                <button
                  onClick={() => handleAction(() => onResume(item.id))}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4 text-green-400" />
                  Resume Download
                </button>
              )}
              
              <button
                onClick={() => handleAction(() => onRemove(item.id))}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Remove Download
              </button>
              
              <hr className="border-white/10" />
              
              <button
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Download Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DownloadCard;
