"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Plus, AlertTriangle, Skull, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { TMDBMovie } from '@/lib/types';

// Extended type for creepy movies
interface CreepyMovie extends TMDBMovie {
  creepyScore: number;
  keywords: string[];
}

interface CreepyCarouselProps {
  className?: string;
}

const CreepyCarousel = ({ className = "" }: CreepyCarouselProps) => {
  const [movies, setMovies] = useState<CreepyMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Creepy keywords for filtering
  const creepyKeywords = [
    "blood",
    "killer", 
    "death",
    "haunted",
    "demon",
    "ghost",
    "psychological",
    "slasher",
    "murder",
    "horror",
    "scary",
    "evil",
    "possessed",
    "curse",
    "monster",
    "vampire",
    "zombie",
    "witch",
    "satanic",
    "gore"
  ];

  // Fetch creepy movies with smart filtering
  useEffect(() => {
    const fetchCreepyMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🎬 Starting to fetch creepy movies...');

        // Step 1: Get horror movies using discover API
        const horrorResponse = await api.discover('movie', {
          genre: '27', // Horror genre ID
          minRating: 6.5,
          sortBy: 'popularity.desc',
          page: 1
        });

        console.log('📹 Horror API response:', horrorResponse);
        const horrorMovies = horrorResponse.results || [];
        console.log('🎭 Horror movies found:', horrorMovies.length);

        if (horrorMovies.length === 0) {
          console.log('⚠️ No horror movies found, using fallback');
          // Fallback: try without genre filter
          const fallbackResponse = await api.discover('movie', {
            minRating: 6.0,
            sortBy: 'popularity.desc',
            page: 1
          });
          const fallbackMovies = fallbackResponse.results || [];
          console.log('🔄 Fallback movies found:', fallbackMovies.length);
          
          // Filter for creepy content from all movies
          const filteredMovies = fallbackMovies.map((movie: TMDBMovie): CreepyMovie => {
            const titleLower = movie.title.toLowerCase();
            const overviewLower = movie.overview.toLowerCase();
            
            const titleHasCreepyWords = creepyKeywords.some(creepy =>
              titleLower.includes(creepy) || overviewLower.includes(creepy)
            );

            const isAdultContent = movie.adult || movie.vote_average >= 7.0;
            const isPopularEnough = movie.popularity > 10;

            let creepyScore = 0;
            if (titleHasCreepyWords) creepyScore += 1;
            if (isAdultContent) creepyScore += 1;
            if (isPopularEnough) creepyScore += 0.5;

            return {
              ...movie,
              creepyScore,
              keywords: []
            };
          });

          const creepyMovies = filteredMovies
            .filter(movie => movie.creepyScore > 0)
            .sort((a, b) => b.creepyScore - a.creepyScore)
            .slice(0, 12);

          console.log('👻 Creepy movies from fallback:', creepyMovies.length);
          setMovies(creepyMovies);
          return;
        }

        // Step 2: Filter movies based on creepy keywords in title and overview
        const filteredMovies = horrorMovies.map((movie: TMDBMovie): CreepyMovie => {
          const titleLower = movie.title.toLowerCase();
          const overviewLower = movie.overview.toLowerCase();
          
          // Check if movie has creepy keywords in title or overview
          const titleHasCreepyWords = creepyKeywords.some(creepy =>
            titleLower.includes(creepy) || overviewLower.includes(creepy)
          );

          // Additional checks for adult rating and popularity
          const isAdultContent = movie.adult || movie.vote_average >= 7.0;
          const isPopularEnough = movie.popularity > 10;

          // Calculate creepy score
          let creepyScore = 0;
          if (titleHasCreepyWords) creepyScore += 1;
          if (isAdultContent) creepyScore += 1;
          if (isPopularEnough) creepyScore += 0.5;

          return {
            ...movie,
            creepyScore,
            keywords: [] // Empty for now since we don't have keywords API
          };
        });

        // Step 3: Sort by creepy score and get top results
        const creepyMovies = filteredMovies
          .filter(movie => movie.creepyScore > 0)
          .sort((a, b) => b.creepyScore - a.creepyScore)
          .slice(0, 12); // Get top 12 creepy movies

        console.log('👻 Final creepy movies count:', creepyMovies.length);
        console.log('🎯 Sample creepy movie:', creepyMovies[0]);

        // If no creepy movies found, show some popular movies
        if (creepyMovies.length === 0) {
          console.log('⚠️ No creepy movies found, showing popular movies');
          const popularMovies = horrorMovies.slice(0, 12).map((movie: TMDBMovie): CreepyMovie => ({
            ...movie,
            creepyScore: 0.5, // Give them minimal score
            keywords: []
          }));
          setMovies(popularMovies);
        } else {
          setMovies(creepyMovies);
        }
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-video bg-gray-800 rounded-lg animate-pulse" />
          ))}
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
          <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No creepy content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
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

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => handlePlay(movie.id)}
          >
            {/* Movie Card */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
              {/* Poster */}
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x281/1a1a1a/ffffff?text=No+Image';
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(movie.id);
                    }}
                  >
                    <Play className="w-4 h-4" fill="white" />
                  </Button>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                  <span className="text-red-400 text-xs">⭐</span>
                  <span className="text-white text-xs font-medium">
                    {movie.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                </div>

                {/* Creepy Score Badge */}
                {movie.creepyScore > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600/80 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-white text-xs font-medium">
                      {movie.creepyScore === 2 ? '🔥' : '⚠️'}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/80 to-transparent p-2">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 text-xs font-medium">
                    {movie.creepyScore === 2 ? 'EXTREME' : 'HORROR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="mt-2">
              <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-red-400 transition-colors">
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
  );
};

export default CreepyCarousel;
