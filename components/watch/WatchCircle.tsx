"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Calendar, Clock, Film } from 'lucide-react';
import Image from 'next/image';

interface WatchCircle {
  _id: string;
  name: string;
  members: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      image: string;
    };
    joinedAt: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    image: string;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastWatchDate: string | null;
    nextScheduledWatch: string | null;
  };
  activeParty?: {
    _id: string;
    movieTitle: string;
    moviePoster: string;
    roomCode: string;
  };
  createdAt: string;
}

interface CreateWatchCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (circle: { name: string; memberIds: string[] }) => void;
  friends: Array<{
    _id: string;
    name: string;
    email: string;
    image: string;
  }>;
}

export function CreateWatchCircleModal({ isOpen, onClose, onCreate, friends }: CreateWatchCircleModalProps) {
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || selectedMembers.length === 0) return;
    
    setIsCreating(true);
    try {
      await onCreate({
        name: name.trim(),
        memberIds: selectedMembers
      });
      setName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Error creating watch circle:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleMember = (friendId: string) => {
    setSelectedMembers(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create Watch Circle</h2>
            <p className="text-gray-400 text-sm">Invite 2-6 friends to watch movies together regularly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Circle Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Movie Night Crew"
                maxLength={50}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Invite Friends</label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {friends.length === 0 ? (
                  <p className="text-gray-500 text-sm">No friends available to invite</p>
                ) : (
                  friends.map(friend => (
                    <div key={friend._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend._id)}
                        onChange={() => toggleMember(friend._id)}
                        className="w-4 h-4 text-red-500 bg-white/10 border-white/20 rounded focus:ring-red-500/20 focus:ring-2"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={friend.image || '/api/placeholder/32/32'}
                            alt={friend.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{friend.name}</p>
                          <p className="text-gray-400 text-xs">{friend.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                {selectedMembers.length + 1} members total
              </p>
              <button
                type="submit"
                disabled={!name.trim() || selectedMembers.length === 0 || isCreating}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Circle'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface WatchCircleCardProps {
  watchCircle: WatchCircle;
  onJoinParty?: (circleId: string) => void;
  onStartParty?: (circleId: string) => void;
}

export function WatchCircleCard({ watchCircle, onJoinParty, onStartParty }: WatchCircleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStreakEmoji = (streak: number) => {
    if (streak >= 8) return '🔥';
    if (streak >= 4) return '⭐';
    if (streak >= 2) return '✨';
    return '🎬';
  };

  const getNextWatchText = () => {
    if (watchCircle.activeParty) {
      return 'Watch Party Active';
    }
    if (watchCircle.streak.nextScheduledWatch) {
      const date = new Date(watchCircle.streak.nextScheduledWatch);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Tonight';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays <= 7) return `In ${diffDays} days`;
      return date.toLocaleDateString();
    }
    return 'Schedule next watch';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#111] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-white/20 transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            {watchCircle.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            {watchCircle.members.length} members
          </div>
        </div>
        
        {/* Streak Indicator */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getStreakEmoji(watchCircle.streak.currentStreak)}</span>
            <div>
              <p className="text-white font-semibold">{watchCircle.streak.currentStreak} Week Streak</p>
              <p className="text-gray-400 text-xs">Longest: {watchCircle.streak.longestStreak} weeks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Preview */}
      <div className="flex items-center gap-2 mb-4">
        {watchCircle.members.slice(0, 4).map((member, index) => (
          <div
            key={member.userId._id}
            className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20"
            title={member.userId.name}
          >
            <Image
              src={member.userId.image || '/api/placeholder/32/32'}
              alt={member.userId.name}
              fill
              className="object-cover"
            />
            {index === 3 && watchCircle.members.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xs font-bold">+{watchCircle.members.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-white/10">
              {/* All Members */}
              <div>
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Members
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {watchCircle.members.map(member => (
                    <div key={member.userId._id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={member.userId.image || '/api/placeholder/32/32'}
                          alt={member.userId.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{member.userId.name}</p>
                        <p className="text-gray-400 text-xs truncate">{member.userId.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Party */}
              {watchCircle.activeParty && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        {watchCircle.activeParty.movieTitle}
                      </h4>
                      <p className="text-red-400 text-sm">Room Code: {watchCircle.activeParty.roomCode}</p>
                    </div>
                    <button
                      onClick={() => onJoinParty?.(watchCircle._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-colors"
                    >
                      Join Party
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onJoinParty?.(watchCircle._id)}
                  className="flex-1 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Watch
                </button>
                <button
                  onClick={() => onStartParty?.(watchCircle._id)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Film className="w-4 h-4" />
                  Start Party
                </button>
              </div>

              {/* Next Watch Info */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{getNextWatchText()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
