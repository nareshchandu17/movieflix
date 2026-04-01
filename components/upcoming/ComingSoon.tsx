"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Calendar, Bell, Plus, Clock, Film } from "lucide-react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reminders, setReminders] = useState<Array<{ id: string; title: string; date: string; type: 'movie' | 'show' }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch upcoming releases
  useEffect(() => {
    const fetchComingSoon = async () => {
      try {
        setLoading(true);
        
        // Get upcoming movies (next 3-6 months)
        const today = new Date();
        const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
        const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
        
        const response = await api.discover('movie', { 
          sortBy: 'primary_release_date.asc', 
          page: 1 
        });
        
        const allMovies = (response.results as TMDBMovie[]) || [];
        // Filter movies releasing in the next 3-6 months
        const upcomingMovies = allMovies.filter(movie => {
          if (!movie.release_date) return false;
          const releaseDate = new Date(movie.release_date);
          return releaseDate >= threeMonthsFromNow && releaseDate <= sixMonthsFromNow;
        });
        setMovies(upcomingMovies.slice(0, 12));
      } catch (error) {
        console.error('Failed to fetch coming soon:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComingSoon();
  }, []);

  const nextSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    if (movies.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(movies.length / 6)) % Math.ceil(movies.length / 6));
    }
  }, [movies.length]);

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
  }, []);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 280 + 16; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth * 6,
        behavior: 'smooth'
      });
    }
  };

  const addReminder = (movie: TMDBMovie) => {
    const newReminder = {
      id: movie.id.toString(),
      title: movie.title,
      date: movie.release_date,
      type: 'movie' as const
    };
    
    setReminders(prev => {
      const exists = prev.some(r => r.id === newReminder.id);
      if (exists) {
        return prev.filter(r => r.id !== newReminder.id);
      }
      return [...prev, newReminder];
    });
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return "Available Now";
    if (daysUntil === 1) return "Tomorrow";
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    if (daysUntil <= 30) return `In ${Math.ceil(daysUntil / 7)} weeks`;
    return `In ${Math.ceil(daysUntil / 30)} months`;
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="text-sm text-red-400">Upcoming Releases</span>
        </div>

        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-start"
                style={{ width: '280px' }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-red-600 rounded-full" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="text-sm text-red-400">Upcoming Releases</span>
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
          onScroll={updateScrollButtons}
          style={{ scrollPaddingLeft: "3rem" }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 snap-start"
              style={{ width: '280px' }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden group/card cursor-pointer"
                   onClick={() => useRouter().push(`/movie/${movie.id}`)}>
                <Image
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  sizes="280px"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center"
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Release Date Badge */}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-bold">
                  {formatReleaseDate(movie.release_date)}
                </div>

                {/* Reminder Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addReminder(movie);
                  }}
                  className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 z-10"
                >
                  <Bell className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Movie Info */}
              <div className="mt-3">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                  <span className="text-red-400 font-semibold">
                    {formatReleaseDate(movie.release_date)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:border-red-600 z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reminders Section */}
      {reminders.length > 0 && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Your Reminders</h3>
            <button
              onClick={() => setReminders([])}
              className="text-red-400 text-sm hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Film className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-semibold text-sm">{reminder.title}</p>
                    <p className="text-gray-400 text-xs">{reminder.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeReminder(reminder.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
