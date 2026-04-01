"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';

interface ProgressIndicatorProps {
  contentId: string;
  duration: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ProgressIndicator({ 
  contentId, 
  duration, 
  showLabel = true, 
  size = 'small',
  className = ''
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [contentId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/history/progress?contentId=${contentId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setProgress(data.data.progress);
        setCompleted(data.data.completed);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;
  const timeRemaining = duration > 0 ? Math.max(0, duration - progress) : 0;

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

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

  if (loading) {
    return (
      <div className={`w-full bg-gray-700 rounded-full animate-pulse ${sizeClasses[size]} ${className}`} />
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Progress Bar */}
      <div className={`relative w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full bg-red-600 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Completion Indicator */}
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            {completed ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-500">Completed</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeRemaining)} left</span>
              </>
            )}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      )}
    </div>
  );
}
