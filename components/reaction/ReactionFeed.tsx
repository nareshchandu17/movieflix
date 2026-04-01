import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Play, Eye, TrendingUp, Clock, User, Sparkles, Film, MoreVertical } from 'lucide-react';
import PremiumReactionClip from './PremiumReactionClip';
import { useReactions } from '@/contexts/ReactionContext';
import { Reaction } from '@/contexts/ReactionContext';

const emotionConfig = {
  'mind-blown': { emoji: '🤯', color: 'from-purple-500 to-pink-500' },
  'funny': { emoji: '😂', color: 'from-yellow-500 to-orange-500' },
  'epic': { emoji: '🔥', color: 'from-red-500 to-orange-500' },
  'emotional': { emoji: '😭', color: 'from-blue-500 to-cyan-500' },
  'plot-twist': { emoji: '😱', color: 'from-purple-600 to-indigo-600' },
  'wow': { emoji: '😮', color: 'from-green-500 to-teal-500' }
};

export default function ReactionFeed() {
  const { reactions, loading, error, likeReaction, shareReaction } = useReactions();
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatDuration = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLike = async (reactionId: string) => {
    try {
      await likeReaction(reactionId);
    } catch (error) {
      console.error('Failed to like reaction:', error);
    }
  };

  const handleShare = async (reactionId: string) => {
    try {
      await shareReaction(reactionId);
    } catch (error) {
      console.error('Failed to share reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading reactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading reactions</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                <Sparkles className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reaction Feed</h1>
                <p className="text-sm text-gray-400">Real-time movie reactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-white">4.8K</p>
            <p className="text-xs text-green-400">↑ 12% today</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">Total Likes</span>
            </div>
            <p className="text-2xl font-bold text-white">879</p>
            <p className="text-xs text-green-400">↑ 8% today</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">Comments</span>
            </div>
            <p className="text-2xl font-bold text-white">135</p>
            <p className="text-xs text-green-400">↑ 15% today</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Shares</span>
            </div>
            <p className="text-2xl font-bold text-white">43</p>
            <p className="text-xs text-green-400">↑ 5% today</p>
          </div>
        </div>

        {/* Reactions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 group cursor-pointer"
              onClick={() => setSelectedReaction(reaction)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20" />
                <img
                  src={reaction.thumbnail}
                  alt={reaction.caption}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-3 bg-red-600 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-xs text-white">{formatDuration(reaction.duration)}</span>
                </div>
                
                {/* Emotion Tags */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {reaction.emotionTags.slice(0, 2).map((tag) => (
                    <div
                      key={tag}
                      className={`px-2 py-1 bg-gradient-to-r ${emotionConfig[tag as keyof typeof emotionConfig]?.color} rounded-lg`}
                    >
                      <span className="text-xs text-white font-medium">
                        {emotionConfig[tag as keyof typeof emotionConfig]?.emoji}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Movie Context */}
                <div className="flex items-center gap-2 text-sm">
                  <Film className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{reaction.movieTitle}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500">{reaction.timestamp}</span>
                </div>

                {/* Caption */}
                {reaction.caption && (
                  <p className="text-white text-sm line-clamp-2">{reaction.caption}</p>
                )}

                {/* User Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{reaction.user.avatar}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{reaction.user.name}</p>
                      <p className="text-gray-500 text-xs">{formatTimeAgo(reaction.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                  <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{reaction.stats.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{reaction.stats.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">{reaction.stats.shares}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500 ml-auto">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">{reaction.stats.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reaction Modal */}
      {selectedReaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={() => setSelectedReaction(null)}
        >
          <div
            className="bg-gray-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{selectedReaction.user.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedReaction.user.name}</p>
                    <p className="text-gray-400 text-sm">{formatTimeAgo(selectedReaction.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReaction(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20" />
              <img
                src={selectedReaction.thumbnail}
                alt={selectedReaction.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 bg-red-600 rounded-full shadow-lg">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Movie Context */}
              <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Film className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Reacting to:</span>
                </div>
                <p className="text-white font-medium">{selectedReaction.movieTitle}</p>
                <p className="text-gray-400 text-sm">{selectedReaction.movieScene} • {selectedReaction.timestamp}</p>
              </div>

              {/* Caption */}
              {selectedReaction.caption && (
                <p className="text-white text-lg">{selectedReaction.caption}</p>
              )}

              {/* Emotion Tags */}
              <div className="flex gap-2">
                {selectedReaction.emotionTags.map((tag) => (
                  <div
                    key={tag}
                    className={`px-3 py-1 bg-gradient-to-r ${emotionConfig[tag as keyof typeof emotionConfig]?.color} rounded-full`}
                  >
                    <span className="text-sm text-white font-medium">
                      {emotionConfig[tag as keyof typeof emotionConfig]?.emoji} {tag.replace('-', ' ').charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{selectedReaction.stats.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedReaction.stats.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>{selectedReaction.stats.shares}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500 ml-auto">
                  <Eye className="w-5 h-5" />
                  <span>{selectedReaction.stats.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Reaction Clip Component */}
      <PremiumReactionClip />
    </div>
  );
}
