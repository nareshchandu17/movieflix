"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Clock, Sun, Moon, Star, Calendar, TrendingUp, Film, Popcorn } from "lucide-react";
import Image from "next/image";

interface TimeBasedMovie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  duration: string;
  genre: string;
  description: string;
  timeSlot: string;
}

// TMDB API configuration
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Genre mappings for TMDB
const GENRE_MAPPINGS = {
  morning: [35, 18, 10751], // Comedy, Drama, Family
  afternoon: [28, 12, 878], // Action, Adventure, Science Fiction
  evening: [53, 9648, 80], // Thriller, Mystery, Crime
  latenight: [27, 53, 9648], // Horror, Thriller, Mystery
  weekend: [28, 35, 18, 12, 878] // Action, Comedy, Drama, Adventure, Sci-Fi
};

// Get current time slot
const getCurrentTimeSlot = (): string => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's weekend (Saturday 12AM to Sunday 11:59PM)
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
      subtitle: "Light & Optimistic",
      gradient: "from-yellow-400/20 to-orange-400/20",
      borderColor: "border-yellow-500/50",
      description: "Perfect start to your day"
    },
    afternoon: {
      icon: TrendingUp,
      title: "Afternoon Energy",
      subtitle: "Action & Adventure",
      gradient: "from-blue-400/20 to-purple-400/20",
      borderColor: "border-blue-500/50",
      description: "High-octane entertainment"
    },
    evening: {
      icon: Moon,
      title: "Evening Mystery",
      subtitle: "Psychological Thrillers",
      gradient: "from-purple-400/20 to-pink-400/20",
      borderColor: "border-purple-500/50",
      description: "Mind-bending stories"
    },
    latenight: {
      icon: Star,
      title: "Late Night Chills",
      subtitle: "Intense Horror",
      gradient: "from-red-400/20 to-gray-400/20",
      borderColor: "border-red-500/50",
      description: "For the brave souls"
    },
    weekend: {
      icon: Popcorn,
      title: "Weekend Watchies",
      subtitle: "Epic Blockbusters",
      gradient: "from-green-400/20 to-blue-400/20",
      borderColor: "border-green-500/50",
      description: "Saturday-Sunday Special"
    }
  };
  
  return info[slot as keyof typeof info] || info.morning;
};

// Fetch movies from TMDB based on genres
const fetchMoviesByGenres = async (genres: number[]): Promise<TimeBasedMovie[]> => {
  if (!API_KEY) {
    console.error('TMDB API key not found. Please set NEXT_PUBLIC_TMDB_API_KEY in your environment variables.');
    console.log('Using fallback movies for time slot:', getCurrentTimeSlot());
    return getFallbackMovies(getCurrentTimeSlot());
  }

  console.log('Fetching movies for genres:', genres);

  try {
    // Fetch movies with multiple genres
    const genreString = genres.join(',');
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&vote_average.gte=7&vote_count.gte=100&language=en-US&page=1`;
    
    console.log('TMDB API URL:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('TMDB API Error:', response.status, response.statusText);
      throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('TMDB Response:', data);
    
    if (!data.results || data.results.length === 0) {
      console.log('No movies found for the selected genres');
      return [];
    }
    
    // Transform TMDB data to our format
    const transformedMovies = data.results.slice(0, 20).map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Poster',
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}` : 'https://via.placeholder.com/1920x800/1a1a1a/ffffff?text=No+Backdrop',
      rating: movie.vote_average,
      year: new Date(movie.release_date).getFullYear(),
      duration: `${Math.floor(Math.random() * 60 + 90)}m`, // Random duration for demo
      genre: movie.genre_ids?.[0] ? getGenreName(movie.genre_ids[0]) : 'Unknown',
      description: movie.overview || 'No description available.',
      timeSlot: getCurrentTimeSlot()
    }));
    
    console.log('Transformed movies:', transformedMovies);
    return transformedMovies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    console.log('Using fallback movies for time slot:', getCurrentTimeSlot());
    return getFallbackMovies(getCurrentTimeSlot());
  }
};

// Fallback sample movies for when TMDB API fails
const getFallbackMovies = (timeSlot: string): TimeBasedMovie[] => {
  const fallbackMovies = {
    morning: [
      {
        id: 'morning-1',
        title: 'The Pursuit of Happyness',
        poster: 'https://via.placeholder.com/500x750/FFE4B5/000000?text=Morning+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/FFE4B5/000000?text=Morning+Backdrop',
        rating: 8.0,
        year: 2006,
        duration: '117m',
        genre: 'Drama',
        description: 'A struggling salesman takes custody of his son.',
        timeSlot: 'morning'
      },
      {
        id: 'morning-2',
        title: 'Forrest Gump',
        poster: 'https://via.placeholder.com/500x750/87CEEB/000000?text=Morning+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/87CEEB/000000?text=Morning+Backdrop',
        rating: 8.8,
        year: 1994,
        duration: '142m',
        genre: 'Drama',
        description: 'The presidencies of Kennedy and Johnson.',
        timeSlot: 'morning'
      }
    ],
    afternoon: [
      {
        id: 'afternoon-1',
        title: 'The Avengers',
        poster: 'https://via.placeholder.com/500x750/FF6B6B/000000?text=Action+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/FF6B6B/000000?text=Action+Backdrop',
        rating: 8.0,
        year: 2012,
        duration: '143m',
        genre: 'Action',
        description: 'Earth\'s mightiest heroes must come together.',
        timeSlot: 'afternoon'
      },
      {
        id: 'afternoon-2',
        title: 'Mad Max: Fury Road',
        poster: 'https://via.placeholder.com/500x750/FF9F40/000000?text=Action+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/FF9F40/000000?text=Action+Backdrop',
        rating: 8.1,
        year: 2015,
        duration: '120m',
        genre: 'Action',
        description: 'A woman rebels against a tyrannical ruler.',
        timeSlot: 'afternoon'
      }
    ],
    evening: [
      {
        id: 'evening-1',
        title: 'The Dark Knight',
        poster: 'https://via.placeholder.com/500x750/4A5568/FFFFFF?text=Thriller+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/4A5568/FFFFFF?text=Thriller+Backdrop',
        rating: 9.0,
        year: 2008,
        duration: '152m',
        genre: 'Action',
        description: 'Batman must accept one of the greatest psychological tests.',
        timeSlot: 'evening'
      },
      {
        id: 'evening-2',
        title: 'Inception',
        poster: 'https://via.placeholder.com/500x750/667EEA/FFFFFF?text=Thriller+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/667EEA/FFFFFF?text=Thriller+Backdrop',
        rating: 8.8,
        year: 2010,
        duration: '148m',
        genre: 'Sci-Fi',
        description: 'A thief who steals corporate secrets through dream-sharing.',
        timeSlot: 'evening'
      }
    ],
    latenight: [
      {
        id: 'latenight-1',
        title: 'The Conjuring',
        poster: 'https://via.placeholder.com/500x750/2D3748/FFFFFF?text=Horror+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/2D3748/FFFFFF?text=Horror+Backdrop',
        rating: 7.5,
        year: 2013,
        duration: '112m',
        genre: 'Horror',
        description: 'Paranormal investigators work to help a family.',
        timeSlot: 'latenight'
      },
      {
        id: 'latenight-2',
        title: 'Get Out',
        poster: 'https://via.placeholder.com/500x750/1A202C/FFFFFF?text=Horror+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/1A202C/FFFFFF?text=Horror+Backdrop',
        rating: 7.7,
        year: 2017,
        duration: '104m',
        genre: 'Horror',
        description: 'A young man uncovers a disturbing secret.',
        timeSlot: 'latenight'
      }
    ],
    weekend: [
      {
        id: 'weekend-1',
        title: 'Interstellar',
        poster: 'https://via.placeholder.com/500x750/9F7AEA/FFFFFF?text=Epic+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/9F7AEA/FFFFFF?text=Epic+Backdrop',
        rating: 8.6,
        year: 2014,
        duration: '169m',
        genre: 'Sci-Fi',
        description: 'A team of explorers travel through a wormhole.',
        timeSlot: 'weekend'
      },
      {
        id: 'weekend-2',
        title: 'The Matrix',
        poster: 'https://via.placeholder.com/500x750/805AD5/FFFFFF?text=Epic+Movie',
        backdrop: 'https://via.placeholder.com/1920x800/805AD5/FFFFFF?text=Epic+Backdrop',
        rating: 8.7,
        year: 1999,
        duration: '136m',
        genre: 'Sci-Fi',
        description: 'A computer hacker learns about the true nature of reality.',
        timeSlot: 'weekend'
      }
    ]
  };
  
  return fallbackMovies[timeSlot as keyof typeof fallbackMovies] || fallbackMovies.morning;
};
const getGenreName = (genreId: number): string => {
  const genreMap: { [key: number]: string } = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };
  return genreMap[genreId] || 'Unknown';
};

export default function TimeBasedDiscovery() {
  const [currentTimeSlot, setCurrentTimeSlot] = useState(getCurrentTimeSlot());
  const [movies, setMovies] = useState<TimeBasedMovie[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showHoverEffects, setShowHoverEffects] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update movies based on time
  useEffect(() => {
    const updateMovies = async () => {
      const slot = getCurrentTimeSlot();
      setCurrentTimeSlot(slot);
      setIsLoading(true);
      setError(null);

      try {
        const genres = GENRE_MAPPINGS[slot as keyof typeof GENRE_MAPPINGS] || GENRE_MAPPINGS.morning;
        const fetchedMovies = await fetchMoviesByGenres(genres);
        setMovies(fetchedMovies);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    updateMovies();
    
    // Update every minute
    const interval = setInterval(updateMovies, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle hover with 0.45s delay for faster response
  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Set timeout to show hover effects after 0.45 seconds (faster)
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverEffects(index);
    }, 450);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setShowHoverEffects(null);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const timeSlotInfo = getTimeSlotInfo(currentTimeSlot);
  const Icon = timeSlotInfo.icon;

  const handleMovieClick = (movieId: string) => {
    router.push(`/movie/${movieId}`);
  };

  if (isLoading) {
    return (
      <div className="relative py-12">
        <div className="flex items-center gap-4 mb-8 px-6">
          <div className="w-12 h-12 rounded-xl bg-gray-800 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-6 bg-gray-800 rounded animate-pulse" />
            <div className="w-32 h-4 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2 px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-60 h-96 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative py-12">
        <div className="flex items-center justify-center px-6">
          <div className="text-center">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 px-6">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${timeSlotInfo.gradient} border ${timeSlotInfo.borderColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {timeSlotInfo.title}
            <span className="text-sm text-gray-400 font-normal">• {timeSlotInfo.description}</span>
          </h2>
          <p className="text-gray-400">{timeSlotInfo.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Current Time Slot Carousel with Full Bleed Effect */}
      {movies.length > 0 ? (
        <>
          {/* Full-Bleed Scroll Container */}
          <div className="relative left-0 right-1/2 -mr-[5vw] w-[calc(100vw+2rem)]">
            <div 
              ref={containerRef}
              className="relative px-6"
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {movies.map((movie, index) => (
                  <motion.div
                    key={`${movie.id}-${currentTimeSlot}`}
                    className="relative flex-shrink-0 transition-all duration-500 ease-out"
                    style={{
                      width: showHoverEffects === index ? '480px' : '240px',
                      height: '280px',
                      zIndex: showHoverEffects === index ? 20 : 10,
                      transformOrigin: 'left center', // Expand from left side only
                      marginLeft: showHoverEffects === index ? '0px' : '0px', // No left shift
                      boxShadow: showHoverEffects === index 
                        ? '0 0 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.2)' // Right bleed effect
                        : 'none'
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    {/* Movie Card */}
                    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer">
                      {/* Backdrop Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={movie.backdrop}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform duration-700"
                          style={{
                            transform: showHoverEffects === index ? 'scale(1.1)' : 'scale(1)'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        {/* Expanded Content (shown on hover) */}
                        <AnimatePresence>
                          {showHoverEffects === index && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                  <span className="text-white text-xs font-medium">{movie.genre}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-white text-sm font-medium">{movie.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-gray-300 text-sm">{movie.year}</span>
                              </div>
                              
                              <h3 className="text-white text-xl font-bold line-clamp-2">{movie.title}</h3>
                              <p className="text-gray-300 text-sm line-clamp-2">{movie.description}</p>
                              
                              <div className="flex items-center gap-4 pt-2">
                                <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                                  Watch Now
                                </button>
                                <span className="text-gray-400 text-sm">{movie.duration}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Compact Content (shown when not hovered) */}
                        {showHoverEffects !== index && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                                <span className="text-white text-xs font-medium">{movie.genre}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-white text-xs">{movie.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <h3 className="text-white text-lg font-semibold line-clamp-2">{movie.title}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span>{movie.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover Effect Border - Removed white border */}
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 transition-colors duration-300 pointer-events-none"
                        style={{
                          borderColor: 'transparent'
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center px-6 py-12">
          <div className="text-center">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No movies available for this time slot</p>
          </div>
        </div>
      )}
    </div>
  );
}
