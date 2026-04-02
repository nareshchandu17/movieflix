"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Calendar, Bell, Plus, Clock, Film, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoon({ title = "Coming Soon" }: ComingSoonProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Array<{ id: string; title: string; date: string; poster?: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch upcoming releases
  useEffect(() => {
    const fetchComingSoon = async () => {
      try {
        setLoading(true);
        const response = await api.getUpcoming('movie', 1);
        setMovies(response.results as TMDBMovie[]);
      } catch (error) {
        console.error('Failed to fetch coming soon:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComingSoon();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleReminder = (movie: TMDBMovie) => {
    setReminders(prev => {
      const exists = prev.some(r => r.id === movie.id.toString());
      if (exists) {
        return prev.filter(r => r.id !== movie.id.toString());
      }
      return [...prev, {
        id: movie.id.toString(),
        title: movie.title,
        date: movie.release_date,
        poster: movie.poster_path
      }];
    });
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return "Coming Soon";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && movies.length === 0) {
    return (
      <div className="py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
          <div className="w-48 h-8 bg-white/5 rounded" />
        </div>
        <div className="flex gap-4 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] md:w-[220px] aspect-[2/3] bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="relative group/section py-8">
      {/* Header - Consistent Alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-amber-500/80 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-1">
              Most Anticipated Releases
            </p>
          </div>
        </div>
      </div>

      {/* Main Track - Full Bleed */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {movies.map((movie, index) => {
            const isReminderSet = reminders.some(r => r.id === movie.id.toString());
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[180px] md:w-[220px] aspect-[2/3] snap-start group/card relative"
              >
                <div 
                  className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/5 group-hover/card:border-amber-500/30"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <Image
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80'}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    sizes="(max-width: 768px) 180px, 220px"
                  />
                  
                  {/* Visual Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="px-1.5 py-0.5 bg-amber-500 rounded text-[9px] font-black text-black uppercase shadow-lg shadow-amber-500/20">
                        Upcoming
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-bold text-white/70">
                         <Calendar className="w-2.5 h-2.5" />
                         {movie.release_date ? movie.release_date.split('-')[0] : ''}
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-sm line-clamp-1 group-hover/card:text-amber-500 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-white/50 text-[10px] font-medium mt-1">
                      {formatReleaseDate(movie.release_date)}
                    </p>
                    
                    {/* Action UI */}
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-1 group-hover/card:translate-y-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReminder(movie);
                        }}
                        className={`flex-1 ${isReminderSet ? 'bg-amber-500 text-black' : 'bg-white hover:bg-amber-500 text-black'} py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 uppercase`}
                      >
                        <Bell className={`w-3.5 h-3.5 ${isReminderSet ? 'fill-current' : ''}`} />
                        {isReminderSet ? 'Reminder Set' : 'Remind Me'}
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Reminders Glassmorphism UI */}
      <AnimatePresence>
        {reminders.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 px-4 sm:px-6 md:px-12 lg:px-20"
          >
            <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden group/reminders">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20 shadow-inner">
                    <Bell className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">My Watchlist Reminders</h3>
                    <p className="text-white/40 text-xs font-medium">We'll notify you when these release</p>
                  </div>
                </div>
                <button 
                  onClick={() => setReminders([])}
                  className="text-white/30 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {reminders.map((reminder) => (
                  <motion.div 
                    layout
                    key={reminder.id}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item"
                  >
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={reminder.poster ? `https://image.tmdb.org/t/p/w200${reminder.poster}` : 'https://via.placeholder.com/200x300'}
                        alt={reminder.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{reminder.title}</p>
                      <p className="text-amber-500/60 text-[10px] font-black uppercase mt-1 tracking-tighter">
                        Coming {formatReleaseDate(reminder.date)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setReminders(prev => prev.filter(r => r.id !== reminder.id))}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500 text-white/30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
