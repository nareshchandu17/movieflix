"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Clock, Sun, Moon, Star, Calendar, TrendingUp, Film, Popcorn, Play, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { api as tmdbApi } from "@/lib/api";
import { TMDBMovie } from "@/lib/types";

// Get current time slot
const getCurrentTimeSlot = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); 
  
  if ((day === 6 && hour >= 0) || (day === 0 && hour < 24)) {
    return "weekend";
  }
  
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "latenight";
};

// Get time slot info
const getTimeSlotInfo = (slot: string) => {
  const info = {
    morning: {
      icon: Sun,
      title: "Morning Vibes",
      subtitle: "Light & Optimistic picks",
      gradient: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-500",
      description: "Start your day right"
    },
    afternoon: {
      icon: TrendingUp,
      title: "Afternoon Energy",
      subtitle: "Action & Adventure",
      gradient: "from-blue-500/20 to-cyan-500/20",
      accent: "text-blue-500",
      description: "High-octane entertainment"
    },
    evening: {
      icon: Moon,
      title: "Evening Mystery",
      subtitle: "Compelling Stories",
      gradient: "from-purple-500/20 to-indigo-500/20",
      accent: "text-purple-500",
      description: "Mind-bending stories"
    },
    latenight: {
      icon: Star,
      title: "Late Night Chills",
      subtitle: "Intense Thrillers",
      gradient: "from-rose-500/20 to-slate-800/20",
      accent: "text-rose-500",
      description: "For the brave souls"
    },
    weekend: {
      icon: Popcorn,
      title: "Weekend Watchies",
      subtitle: "Epic Blockbusters",
      gradient: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-500",
      description: "Saturday-Sunday Special"
    }
  };
  
  return info[slot as keyof typeof info] || info.morning;
};

// Genre mappings for TMDB
const GENRE_MAPPINGS = {
  morning: '35,18,10751', 
  afternoon: '28,12,878', 
  evening: '53,9648,80', 
  latenight: '27,53,9648',
  weekend: '28,35,18,12,878' 
};

export default function TimeBasedDiscovery() {
  const [currentTimeSlot, setCurrentTimeSlot] = useState(getCurrentTimeSlot());
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const slot = getCurrentTimeSlot();
      setCurrentTimeSlot(slot);
      setIsLoading(true);

      try {
        const genreIds = GENRE_MAPPINGS[slot as keyof typeof GENRE_MAPPINGS];
        const response = await tmdbApi.discover('movie', { 
            genre: genreIds, 
            sortBy: 'popularity.desc',
            page: 1 
        });
        setMovies(response.results as TMDBMovie[]);
      } catch (err) {
        console.error('Failed to load time-based movies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
    const interval = setInterval(fetchMovies, 300000); // 5 minutes
    return () => clearInterval(interval);
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

  const timeSlotInfo = getTimeSlotInfo(currentTimeSlot);
  const Icon = timeSlotInfo.icon;

  if (isLoading && movies.length === 0) {
    return (
      <div className="py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center gap-4 animate-pulse">
           <div className="w-12 h-12 rounded-xl bg-white/5" />
           <div className="space-y-2">
             <div className="w-48 h-6 bg-white/5 rounded" />
             <div className="w-32 h-4 bg-white/5 rounded" />
           </div>
        </div>
        <div className="flex gap-4 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] aspect-[16/9] bg-white/5 rounded-xl " />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <div className="relative group/section py-6">
      {/* Time Slot Header - Consistent Alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-end justify-between">
        <div className="flex items-center gap-5">
           <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${timeSlotInfo.gradient} border border-white/10 shadow-lg shadow-black/20 backdrop-blur-md`}>
            <Icon className={`w-7 h-7 ${timeSlotInfo.accent} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {timeSlotInfo.title}
              </h2>
              <span className="hidden sm:block text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest mt-1">
                {currentTimeSlot}
              </span>
            </div>
            <p className="text-white/50 text-sm md:text-base font-medium mt-1">
              {timeSlotInfo.subtitle} • <span className="text-white/30">{timeSlotInfo.description}</span>
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-xl">
           <Clock className="w-4 h-4 text-white/40" />
           <span className="text-sm font-bold text-white/60 tracking-tighter">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </span>
        </div>
      </div>

      {/* Main Feature Container - Full Bleed */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={`${movie.id}-${currentTimeSlot}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-shrink-0 w-[240px] md:w-[320px] aspect-[16/10] snap-start group/card relative"
            >
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/5 group-hover/card:border-white/20"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <Image
                  src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80'}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 240px, 320px"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase border border-white/10">
                      Movie
                    </div>
                    {movie.vote_average && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-white font-black text-sm md:text-base line-clamp-1 group-hover/card:tracking-tight transition-all duration-300">
                    {movie.title}
                  </h3>
                  
                  {/* Action Bar - Reveals on Hover */}
                  <div className="flex items-center gap-3 mt-3 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                      <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    </button>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/40 transition-colors border border-white/10">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1" />
                    <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
                      {movie.release_date ? movie.release_date.split('-')[0] : ''}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
