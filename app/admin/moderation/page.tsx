"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Play,
  Film,
  User as UserIcon,
  Filter,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModerationReaction {
  _id: string;
  userId: {
    name: string;
    avatar: string;
  };
  movieId: string;
  videoUrl: string;
  thumbnailUrl: string;
  moodEmoji: string;
  caption: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function ModerationPage() {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState<ModerationReaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [statusFilter]);

  const fetchReactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reactions?status=${statusFilter}`);
      const data = await res.json();
      setReactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActioningId(id);
    try {
      const res = await fetch('/api/admin/reactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        setReactions(prev => prev.filter(r => r._id !== id));
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActioningId(null);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto" />
          <h1 className="text-white text-xl font-bold">Admin Access Required</h1>
          <p className="text-zinc-500">Please sign in to access the moderation dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-blue-500 w-8 h-8" />
              Content Moderation
            </h1>
            <p className="text-zinc-500 text-sm">Review and manage Fan Reactions before they go live.</p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {(['pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {status === 'pending' && <Clock className="w-4 h-4" />}
                {status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                {status === 'rejected' && <XCircle className="w-4 h-4" />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : reactions.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-zinc-700" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-white">No {statusFilter} reactions</h2>
              <p className="text-zinc-500 max-w-xs mx-auto">Content will appear here when users upload new Fan Reactions.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {reactions.map((reaction) => (
                <motion.div
                  key={reaction._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col"
                >
                  {/* Video Preview Container */}
                  <div className="relative aspect-[9/16] bg-black">
                    <img 
                      src={reaction.thumbnailUrl} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Mood & Info Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-xl shadow-xl">
                        {reaction.moodEmoji}
                      </div>
                    </div>

                    <a 
                      href={reaction.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    >
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <Play className="text-white fill-white w-8 h-8 ml-1" />
                      </div>
                    </a>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                          {reaction.userId?.avatar ? (
                            <img src={reaction.userId.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                              <UserIcon className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-white truncate">{reaction.userId?.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-zinc-500">{new Date(reaction.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Film className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider font-semibold">Movie ID: {reaction.movieId}</span>
                        </div>
                        <p className="text-sm text-zinc-300 line-clamp-2 italic">
                          "{reaction.caption || 'No caption'}"
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {statusFilter === 'pending' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                        <button
                          onClick={() => handleAction(reaction._id, 'rejected')}
                          disabled={actioningId === reaction._id}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(reaction._id, 'approved')}
                          disabled={actioningId === reaction._id}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 text-black hover:bg-white transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
