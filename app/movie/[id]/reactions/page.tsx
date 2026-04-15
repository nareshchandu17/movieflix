"use client";

import React, { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Grid, Layout, SlidersHorizontal, Search, Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactionCard } from '@/components/reactions/ReactionCard';

interface ReactionsPageProps {
  params: Promise<{ id: string }>;
}

export default function ReactionsPage({ params }: ReactionsPageProps) {
  const router = useRouter();
  const { id: movieId } = use(params);
  
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieTitle, setMovieTitle] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch reactions
        const res = await fetch(`/api/movies/${movieId}/reactions?limit=20`);
        const data = await res.json();
        setReactions(data.reactions || []);
        
        // Fetch movie details for title
        const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        if (movieRes.ok) {
           const movieData = await movieRes.json();
           setMovieTitle(movieData.title);
        }
      } catch (error) {
        console.error("Failed to load reactions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Fan Reactions
              </h1>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest mt-0.5">
                {movieTitle || "Loading Movie..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-red-500/50 transition-all">
              <Search className="w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search reactions..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-48"
              />
            </div>
            
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('feed')}
                className={`p-2 rounded-md transition-all ${viewMode === 'feed' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'trending', 'recent', 'most-liked'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                  filter === f 
                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            Sort By
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : reactions.length > 0 ? (
          <motion.div 
            layout
            className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              : "max-w-2xl mx-auto space-y-12"
            }
          >
            <AnimatePresence mode="popLayout">
              {reactions.map((reaction, index) => (
                <motion.div
                  key={reaction._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReactionCard reaction={reaction} movieId={movieId} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
              <Play className="w-8 h-8 text-red-500 fill-current" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Reactions Found</h2>
            <p className="text-white/40 max-w-sm">
              Be the first to record a reaction for this movie. Start watching and click the React button!
            </p>
            <button 
              onClick={() => router.push(`/watch/${movieId}`)}
              className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-all hover:scale-105"
            >
              Start Watching
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
