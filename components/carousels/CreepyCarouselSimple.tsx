"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Plus, AlertTriangle, Skull } from 'lucide-react';
import { api } from '@/lib/api';
import { TMDBMovie } from '@/lib/types';

interface CreepyCarouselSimpleProps {
  className?: string;
}

const CreepyCarouselSimple = ({ className = "" }: CreepyCarouselSimpleProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  console.log('👻 CreepyCarouselSimple component mounted');

  // Creepy keywords for filtering
  const creepyKeywords = [
    "blood", "killer", "death", "haunted", "demon", 
    "ghost", "psychological", "slasher", "murder", 
    "horror", "scary", "evil", "possessed", 
    "curse", "monster", "vampire", "zombie"
  ];

  useEffect(() => {
    const fetchCreepyMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🎬 Starting to fetch creepy movies...');

        // Fetch horror movies using the API
        const response = await api.discover('movie', {
          genre: '27',
          minRating: 6.0,
          sortBy: 'popularity.desc',
          page: 1
        });

        console.log('📹 API response:', response);
        const horrorMovies = (response.results as TMDBMovie[]) || [];
        console.log('🎭 Horror movies found:', horrorMovies.length);

        // Filter for creepy content based on keywords
        const creepyMovies = horrorMovies.filter(movie => {
          const titleLower = movie.title.toLowerCase();
          const overviewLower = movie.overview.toLowerCase();
          
          return creepyKeywords.some(keyword => 
            titleLower.includes(keyword) || overviewLower.includes(keyword)
          );
        });

        console.log('👻 Creepy movies after filtering:', creepyMovies.length);
        
        // If no creepy movies found, use first 20 horror movies for carousel
        const finalMovies = creepyMovies.length > 0 ? creepyMovies.slice(0, 20) : horrorMovies.slice(0, 20);
        setMovies(finalMovies);

      } catch (error) {
        console.error('❌ Failed to fetch creepy movies:', error);
        setError('Failed to load creepy content');
      } finally {
        setLoading(false);
      }
    };

    fetchCreepyMovies();
  }, []);

  const handlePlay = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  const handleAddToList = (movieId: number) => {
    console.log('Added to list:', movieId);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
          </div>
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>18+ Content</span>
          </div>
        </div>
        
        {/* Loading State - Full Bleed (matching other carousels) */}
        <div className="relative left-0 right-1/2 -mr-[50vw] w-[calc(100vw+2rem)]">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth creepy-carousel-container py-4 px-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className="snap-start flex-shrink-0" style={{ width: '220px' }}>
                <div className="relative aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
                <div className="mt-2">
                  <div className="h-4 bg-gray-800 rounded animate-pulse mb-1" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-16" />
                </div>
                <div className="mt-2 h-6 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
          </div>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Skull className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No creepy content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      

      {/* Movies Carousel - Full Bleed (matching other carousels) */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="relative group">
          {/* Header */}
         <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skull className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">Don't Watch It Alone</h2>
          </div>
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>18+ Content</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm">Live Now</span>
          </div>
        </div>

          <button
            onClick={() => {
              const container = document.querySelector('.creepy-carousel-container');
              if (container) {
                container.scrollBy({ left: -240, behavior: 'smooth' });
              }
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              const container = document.querySelector('.creepy-carousel-container');
              if (container) {
                container.scrollBy({ left: 240, behavior: 'smooth' });
              }
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-100 z-20 border border-white/10 hover:border-red-500/50"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scroll Container */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth creepy-carousel-container py-4 px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {movies.map((movie, index) => (
              <motion.div
                key={`${movie.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="snap-start flex-shrink-0 cursor-pointer"
                onClick={() => handlePlay(movie.id)}
                style={{ width: '220px' }}
              >
                {/* Movie Card */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900">
                  {/* Poster */}
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/220x330/1a1a1a/ffffff?text=No+Image';
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 transform scale-0 hover:scale-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(movie.id);
                        }}
                      >
                        <Play className="w-5 h-5" fill="white" />
                      </Button>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-red-400 text-xs">⭐</span>
                      <span className="text-white text-xs font-medium">
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Warning Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/90 to-transparent p-2">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-red-400 text-xs font-medium">HORROR</span>
                    </div>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="mt-2">
                  <h3 className="text-white text-sm font-medium line-clamp-1 hover:text-red-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {movie.release_date?.slice(0, 4) || 'Unknown'} • {movie.adult ? '18+' : '16+'}
                  </p>
                </div>

                {/* Add to List Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToList(movie.id);
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </motion.div>
            ))}
            <div className="flex-shrink-0 w-12 md:w-20" />
          </div>
        </div>
        {/* Warning Footer */}
      <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-400 text-sm font-medium">Content Warning</p>
            <p className="text-gray-400 text-xs">
              This content contains graphic violence, horror themes, and disturbing imagery. Viewer discretion is advised.
            </p>
          </div>
        </div>
      </div>
      </div>

      
    </div>
  );
};

export default CreepyCarouselSimple;
