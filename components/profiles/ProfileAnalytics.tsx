"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Film, 
  Tv, 
  Users, 
  Calendar,
  Award,
  Eye
} from 'lucide-react';
import type { Profile } from '@/types/profiles';

interface AnalyticsData {
  totalWatchTime: number;
  moviesWatched: number;
  seriesWatched: number;
  episodesWatched: number;
  averageSessionDuration: number;
  mostWatchedGenre: string;
  mostWatchedTimeOfDay: string;
  weeklyWatchTime: number;
  monthlyWatchTime: number;
  favoriteActors: string[];
  favoriteDirectors: string[];
  contentPreferences: {
    genres: { [genre: string]: number };
    ratings: { [rating: string]: number };
    decades: { [decade: string]: number };
  };
  insights: string[];
}

interface ProfileAnalyticsProps {
  profile: Profile;
  onClose: () => void;
}

export default function ProfileAnalytics({ profile, onClose }: ProfileAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [profile.profileId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/analytics/${profile.profileId}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '🕐';
    }
  };

  const getGenreChartData = () => {
    if (!analytics?.contentPreferences.genres) return [];
    return Object.entries(analytics.contentPreferences.genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
  };

  const getRatingDistribution = () => {
    if (!analytics?.contentPreferences.ratings) return [];
    return Object.entries(analytics.contentPreferences.ratings)
      .map(([rating, count]) => ({ rating, count }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-r-transparent animate-spin rounded-full"></div>
            <p className="text-white text-lg">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
          <p className="text-white text-lg text-center">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 flex items-center justify-center"
            >
              <span className="text-lg font-bold text-white">
                {profile.name[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.name}'s Analytics</h2>
              <p className="text-sm text-gray-400">
                {profile.isKids ? 'Kids Profile' : 'Adult Profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Profile Insights
            </h3>
            <div className="space-y-2">
              {analytics.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-blue-300"
                >
                  • {insight}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Total Watch Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(analytics.totalWatchTime)}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Film className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Movies Watched</span>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.moviesWatched}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Series Watched</span>
            </div>
            <p className="text-2xl font-bold text-white">{analytics.seriesWatched}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Avg Session</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(analytics.averageSessionDuration)}</p>
          </div>
        </div>

        {/* Weekly & Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">This Week</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(analytics.weeklyWatchTime)}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analytics.weeklyWatchTime / (24 * 60)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">This Month</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatTime(analytics.monthlyWatchTime)}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((analytics.monthlyWatchTime / (30 * 24 * 60)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Genres */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              Top Genres
            </h3>
            <div className="space-y-2">
              {getGenreChartData().map(({ genre, count }, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{genre}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(count / Math.max(...getGenreChartData().map(g => g.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Watch Patterns */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Watch Patterns
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Most Active Time</span>
                <span className="text-sm font-semibold text-white">
                  {getTimeOfDayIcon(analytics.mostWatchedTimeOfDay)} {analytics.mostWatchedTimeOfDay}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Favorite Genre</span>
                <span className="text-sm font-semibold text-yellow-400">{analytics.mostWatchedGenre}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Content */}
        {(analytics.favoriteActors.length > 0 || analytics.favoriteDirectors.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.favoriteActors.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Favorite Actors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.favoriteActors.slice(0, 6).map((actor, index) => (
                    <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analytics.favoriteDirectors.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Favorite Directors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.favoriteDirectors.slice(0, 6).map((director, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      {director}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
