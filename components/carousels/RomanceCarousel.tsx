"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Plus, Heart, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { TMDBMovie } from '@/lib/types';

interface RomanceCarouselProps {
  className?: string;
}

const RomanceCarousel = ({ className = "" }: RomanceCarouselProps) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Romance keywords for filtering
  const romanceKeywords = [
    "love",
    "romance",
    "romantic",
    "relationship",
    "dating",
    "marriage",
    "wedding",
    "couple",
    "heart",
    "kiss",
    "passion",
    "affair",
    "valentine",
    "destiny",
    "soulmate",
    "crush",
    "intimate"
  ];

  // Fetch romance movies with smart filtering
  useEffect(() => {
    const fetchRomanceMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get romance movies using discover API (genre ID 10749)
        const romanceResponse = await api.discover('movie', {
          genre: '10749', // Romance genre ID
          minRating: 6.0,
          sortBy: 'popularity.desc',
          page: 1
        });

        const romanceMovies = romanceResponse.results || [];

        // Step 2: Filter movies based on romance keywords in title and overview
        const filteredMovies = romanceMovies.map((movie: TMDBMovie) => {
          const titleLower = movie.title.toLowerCase();
          const overviewLower = movie.overview.toLowerCase();
          
          // Check if movie has romance keywords in title or overview
          const hasRomanceKeywords = romanceKeywords.some(keyword =>
            titleLower.includes(keyword) || overviewLower.includes(keyword)
          );

          // Additional checks for romance content
          const isHighRating = movie.vote_average >= 7.0;
          const isPopular = movie.popularity > 15;

          // Calculate romance score
          let romanceScore = 0;
          if (hasRomanceKeywords) romanceScore += 1;
          if (isHighRating) romanceScore += 1;
          if (isPopular) romanceScore += 0.5;

          return {
            ...movie,
            romanceScore
          };
        });

        // Step 3: Sort by romance score and get top results
        const bestRomanceMovies = filteredMovies
          .filter(movie => movie.romanceScore > 0)
          .sort((a, b) => b.romanceScore - a.romanceScore)
          .slice(0, 12); // Get top 12 romance movies

        setMovies(bestRomanceMovies);
      } catch (error) {
        console.error('Failed to fetch romance movies:', error);
        setError('Failed to load romance content');
      } finally {
        setLoading(false);
      }
    };

    fetchRomanceMovies();
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
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-white">Romantic Movies</h2>
          </div>
          <div className="flex items-center gap-1 text-pink-500 text-sm">
            <Star className="w-4 h-4" />
            <span>Love Stories</span>
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
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-white">Romantic Movies</h2>
          </div>
        </div>
        
        <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4 text-center">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-pink-400">{error}</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-white">Romantic Movies</h2>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No romance content found</p>
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
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-bold text-white">Romantic Movies</h2>
          </div>
          <div className="flex items-center gap-1 text-pink-500 text-sm">
            <Star className="w-4 h-4" />
            <span>Love Stories</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          <span className="text-pink-400 text-sm">Trending</span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"
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
                  <span className="text-pink-400 text-xs">⭐</span>
                  <span className="text-white text-xs font-medium">
                    {movie.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                </div>

                {/* Romance Score Badge */}
                {(movie as any).romanceScore > 1 && (
                  <div className="absolute top-2 left-2 bg-pink-600/80 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-white text-xs font-medium">
                      ❤️
                    </span>
                  </div>
                )}
              </div>

              {/* Heart Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-900/80 to-transparent p-2">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span className="text-pink-400 text-xs font-medium">
                    ROMANCE
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="mt-2">
              <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-pink-400 transition-colors">
                {movie.title}
              </h3>
              <p className="text-gray-400 text-xs">
                {movie.release_date?.slice(0, 4) || 'Unknown'} • {movie.adult ? '18+' : 'PG-13'}
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

      {/* Romance Footer */}
      <div className="mt-6 bg-pink-900/20 border border-pink-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-pink-500" />
          <div>
            <p className="text-pink-400 text-sm font-medium">Love Stories</p>
            <p className="text-gray-400 text-xs">
              Discover the most romantic movies that will make your heart flutter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RomanceCarousel;
