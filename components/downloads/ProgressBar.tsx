"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBarProps, DownloadStatus } from '@/types/downloads';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Download, Pause } from 'lucide-react';

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  speed,
  timeRemaining,
  showDetails = true,
  animated = true
}) => {
  const getProgressColor = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'queued': return 'bg-blue-500';
      case 'expired': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  const getProgressGlow = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
      case 'completed': return 'shadow-[0_0_20px_rgba(34,197,94,0.4)]';
      case 'paused': return 'shadow-[0_0_20px_rgba(234,179,8,0.4)]';
      case 'failed': return 'shadow-[0_0_20px_rgba(239,68,68,0.4)]';
      case 'queued': return 'shadow-[0_0_20px_rgba(59,130,246,0.4)]';
      case 'expired': return 'shadow-[0_0_20px_rgba(249,115,22,0.4)]';
      default: return '';
    }
  };

  const getStatusIcon = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading': return <Download className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'queued': return <Wifi className="w-4 h-4" />;
      case 'expired': return <WifiOff className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

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

  const isActive = status === 'downloading';
  const isCompleted = status === 'completed';
  const hasError = status === 'failed';

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getProgressColor(status)} rounded-full ${getProgressGlow(status)}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0, 
            ease: 'easeOut',
            delay: animated ? 0.1 : 0
          }}
        />
        
        {/* Animated shimmer for active downloads */}
        {isActive && animated && (
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'linear',
              repeatDelay: 0.5
            }}
          />
        )}
        
        {/* Completion checkmark */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
        
        {/* Error indicator */}
        {hasError && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="font-black uppercase tracking-widest">
                {getStatusText(status)}
              </span>
            </div>
            
            {speed && isActive && (
              <>
                <span className="text-slate-500">•</span>
                <span className="font-black uppercase tracking-widest text-slate-400">
                  {speed}
                </span>
              </>
            )}
            
            {timeRemaining && !isCompleted && (
              <>
                <span className="text-slate-500">•</span>
                <span className="font-black uppercase tracking-widest text-slate-400">
                  {timeRemaining}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-black text-white">
              {Math.round(progress)}%
            </span>
            
            {isActive && (
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity 
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
