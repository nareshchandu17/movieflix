"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Plus, AlertTriangle, Skull, Eye } from 'lucide-react';
import { TMDBMovie } from '@/lib/types';

// Extended type for creepy movies
interface CreepyMovie extends TMDBMovie {
  creepyScore: number;
  keywords: string[];
}

interface CreepyCarouselProps {
  className?: string;
}

// Mock creepy movies data for testing
const mockCreepyMovies: CreepyMovie[] = [
  {
    id: 1657198,
    title: "The Conjuring: The Devil Made Me Do It",
    overview: "Paranormal investigators Ed and Lorraine Warren encounter what would become one of the most sensational cases from their files.",
    poster_path: "/xbSuFiJLL4dNToNTi8VLBA1f2c.jpg",
    backdrop_path: "/aA5Mj92tOoU6B1S5AYhXcLnGn.jpg",
    vote_average: 7.3,
    popularity: 3214.5,
    adult: false,
    release_date: "2021-06-04",
    vote_count: 1547,
    genre_ids: [27, 53],
    original_language: "en",
    original_title: "The Conjuring: The Devil Made Me Do It",
    video: false,
    creepyScore: 2.5,
    keywords: ["horror", "supernatural", "demon"]
  },
  {
    id: 508947,
    title: "Scream",
    overview: "A new killer dons the Ghostface mask and a new string of murders begins.",
    poster_path: "/kZvS67eSxhUrYDTRlHQ5l3I5qW.jpg",
    backdrop_path: "/fZ5IbrIwL6y1dPHcZ1h4R4rX.jpg",
    vote_average: 6.8,
    popularity: 1856.2,
    adult: false,
    release_date: "2022-01-14",
    vote_count: 2843,
    genre_ids: [27, 9648],
    original_language: "en",
    original_title: "Scream",
    video: false,
    creepyScore: 2.0,
    keywords: ["killer", "horror", "slasher"]
  },
  {
    id: 460458,
    title: "A Quiet Place Part II",
    overview: "Following the events at home, the Abbott family now face the terrors of the outside world.",
    poster_path: "/4q2hz2m8hubgvijO8idavGxz2d4.jpg",
    backdrop_path: "/4q2hz2m8hubgvijO8idavGxz2d4.jpg",
    vote_average: 7.2,
    popularity: 2891.7,
    adult: false,
    release_date: "2020-03-18",
    vote_count: 6789,
    genre_ids: [27, 18, 878],
    original_language: "en",
    original_title: "A Quiet Place Part II",
    video: false,
    creepyScore: 1.5,
    keywords: ["horror", "monster", "survival"]
  },
  {
    id: 566525,
    title: "Hereditary",
    overview: "After the family matriarch passes away, a grieving family begins to unravel terrifying secrets.",
    poster_path: "/4iBfJ4y5ZVYVeLwYzeo4n0uYZd.jpg",
    backdrop_path: "/4iBfJ4y5ZVYVeLwYzeo4n0uYZd.jpg",
    vote_average: 7.3,
    popularity: 2156.8,
    adult: false,
    release_date: "2018-06-08",
    vote_count: 8765,
    genre_ids: [27],
    original_language: "en",
    original_title: "Hereditary",
    video: false,
    creepyScore: 2.0,
    keywords: ["horror", "family", "creepy"]
  },
  {
    id: 512195,
    title: "The Invisible Man",
    overview: "A woman believes she is being stalked by her abusive ex-boyfriend after he fakes his death.",
    poster_path: "/6gNnFWjZo2j4G5l8P5Y5L4K5I4.jpg",
    backdrop_path: "/6gNnFWjZo2j4G5l8P5Y5L4K5I4.jpg",
    vote_average: 7.1,
    popularity: 1654.3,
    adult: false,
    release_date: "2020-02-26",
    vote_count: 5432,
    genre_ids: [27, 53, 9648],
    original_language: "en",
    original_title: "The Invisible Man",
    video: false,
    creepyScore: 1.5,
    keywords: ["horror", "psychological", "thriller"]
  },
  {
    id: 458723,
    title: "Us",
    overview: "A family's serene beach vacation turns to chaos when their doppelgängers appear.",
    poster_path: "/t2pAadDZm7CJm7I5K4N6l6J5yB.jpg",
    backdrop_path: "/t2pAadDZm7CJm7I5K4N6l6J5yB.jpg",
    vote_average: 6.8,
    popularity: 1987.6,
    adult: false,
    release_date: "2019-03-20",
    vote_count: 9876,
    genre_ids: [27, 53],
    original_language: "en",
    original_title: "Us",
    video: false,
    creepyScore: 2.0,
    keywords: ["horror", "doppelganger", "creepy"]
  }
];

const CreepyCarousel = ({ className = "" }: CreepyCarouselProps) => {
  const [movies, setMovies] = useState<CreepyMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const router = useRouter();

  // Fetch creepy movies with smart filtering
  useEffect(() => {
    const fetchCreepyMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🎬 Starting to fetch creepy movies...');

        // Try to fetch real data first
        try {
          const response = await fetch('/api/discover/movie?genre=27&minRating=6.5&sortBy=popularity.desc&page=1');
          if (!response.ok) {
            throw new Error('API request failed');
          }
          
          const data = await response.json();
          console.log('📹 API response:', data);
          
          if (data.success && data.data && data.data.results) {
            const horrorMovies = data.data.results;
            console.log('🎭 Horror movies found:', horrorMovies.length);
            
            if (horrorMovies.length > 0) {
              setMovies(horrorMovies.slice(0, 6).map((movie: TMDBMovie): CreepyMovie => ({
                ...movie,
                creepyScore: 1.5,
                keywords: []
              })));
              setUseMockData(false);
              return;
            }
          }
        } catch (apiError) {
          console.warn('⚠️ API failed, using mock data:', apiError);
        }

        // Fallback to mock data
        console.log('👻 Using mock creepy movies data');
        setMovies(mockCreepyMovies);
        setUseMockData(true);

      } catch (error) {
        console.error('❌ Failed to fetch creepy movies:', error);
        setError('Failed to load creepy content');
        // Still show mock data on error
        setMovies(mockCreepyMovies);
        setUseMockData(true);
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

  if (error && movies.length === 0) {
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
          {useMockData && (
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Demo Data</span>
            </div>
          )}
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
            key={`${movie.id}-${index}`}
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
                      {movie.creepyScore >= 2 ? '🔥' : '⚠️'}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/80 to-transparent p-2">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 text-xs font-medium">
                    {movie.creepyScore >= 2 ? 'EXTREME' : 'HORROR'}
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
