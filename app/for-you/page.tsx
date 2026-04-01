"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Clock, Star, Calendar, TrendingUp, Film, Popcorn, Play, Info, ChevronRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  duration: string;
  genre: string;
  description: string;
  matchPercentage?: number;
  aiReason?: string;
}

interface AIExplanation {
  summary: string;
  reasoning: string;
  recommendations: Movie[];
}

// TMDB API configuration
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function ForYouPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [aiPicks, setAiPicks] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const microCategories = [
    "Dark & Intense",
    "Underrated Gems", 
    "Mind-Bending",
    "Fast 90-min Watch",
    "Critics' Choice",
    "Hidden Treasures"
  ];

  // Fetch movies from TMDB
  const fetchMovies = async (query?: string): Promise<Movie[]> => {
    if (!API_KEY) return [];

    try {
      let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&vote_average.gte=7&vote_count.gte=100&language=en-US&page=1`;
      
      if (query) {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch movies');

      const data = await response.json();
      
      return data.results.slice(0, 20).map((movie: any) => ({
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/api/placeholder/500/750',
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}` : '/api/placeholder/1920/800',
        rating: movie.vote_average,
        year: new Date(movie.release_date).getFullYear(),
        duration: `${Math.floor(Math.random() * 60 + 90)}m`,
        genre: movie.genre_ids?.[0] ? getGenreName(movie.genre_ids[0]) : 'Unknown',
        description: movie.overview || 'No description available.',
        matchPercentage: Math.floor(Math.random() * 30 + 70), // Simulated AI match
        aiReason: "Based on your viewing history and preferences"
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  };

  // Get genre name from ID
  const getGenreName = (genreId: number): string => {
    const genreMap: { [key: number]: string } = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genreMap[genreId] || 'Unknown';
  };

  // Generate AI explanation (simulated)
  const generateAIExplanation = async (movie: Movie): Promise<AIExplanation> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const explanations = [
      {
        summary: `${movie.title} is a masterpiece that perfectly aligns with your taste for complex narratives and exceptional cinematography.`,
        reasoning: `You enjoy slow-burn crime stories and morally complex characters. This matches your interest in Breaking Bad, Mindhunter, and similar psychological thrillers that explore the depths of human nature.`
      },
      {
        summary: `A gripping tale that combines your favorite elements of suspense with outstanding character development.`,
        reasoning: `Based on your history with thriller and mystery genres, this film's intricate plot and atmospheric tension will keep you engaged throughout.`
      }
    ];

    const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];
    const recommendations = await fetchMovies();

    return {
      ...randomExplanation,
      recommendations: recommendations.slice(0, 10).map(rec => ({
        ...rec,
        matchPercentage: Math.floor(Math.random() * 20 + 80),
        aiReason: "Similar tone and themes"
      }))
    };
  };

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchMovies(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle movie selection
  const handleMovieSelect = async (movie: Movie) => {
    setSelectedMovie(movie);
    setSearchQuery(movie.title);
    setShowSearchDropdown(false);
    
    // Generate AI explanation
    setIsLoading(true);
    const explanation = await generateAIExplanation(movie);
    setAiExplanation(explanation);
    setIsLoading(false);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [initialMovies, initialAiPicks] = await Promise.all([
          fetchMovies(),
          fetchMovies()
        ]);
        setMovies(initialMovies);
        setAiPicks(initialAiPicks.slice(0, 8));
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Sticky Top Bar */}
      <div className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
          {/* Left Section - Back Button and Logo */}
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#00E5FF]" />
              <span className="text-xl font-bold">For You</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search movies, moods, or anything… (e.g. 'dark crime like breaking bad')"
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#00E5FF] focus:bg-white/15 transition-all"
              />
            </div>

            {/* Search Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && (searchResults.length > 0 || isLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-pulse">Searching...</div>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => handleMovieSelect(movie)}
                          className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-16 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                            <Image
                              src={movie.poster}
                              alt={movie.title}
                              width={48}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{movie.title}</div>
                            <div className="text-sm text-gray-400">{movie.genre} • {movie.year}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">KL</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        {/* AI Result Card */}
        <AnimatePresence>
          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="relative h-[480px] rounded-2xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                  <Image
                    src={selectedMovie.backdrop}
                    alt={selectedMovie.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-end p-8">
                  <div className="flex gap-8">
                    {/* Poster */}
                    <div className="w-[220px] h-[330px] rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedMovie.poster}
                        alt={selectedMovie.title}
                        width={220}
                        height={330}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h1 className="text-4xl font-bold mb-2">{selectedMovie.title}</h1>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-white/20 rounded-full">{selectedMovie.genre}</span>
                          <span>{selectedMovie.duration}</span>
                          <span>{selectedMovie.year}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{selectedMovie.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                          <span className="text-[#00E5FF] font-medium">AI Summary</span>
                        </div>
                        <p className="text-lg leading-relaxed">
                          {aiExplanation?.summary || "Analyzing movie for you..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Explanation Layer */}
        <AnimatePresence>
          {aiExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[#00E5FF]" />
                  Why this fits you
                </h2>
                <p className="text-gray-300 leading-relaxed">{aiExplanation.reasoning}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Picks Carousel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#00E5FF]" />
            You'll love these
          </h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {aiPicks.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[180px] group cursor-pointer"
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative h-[270px] rounded-xl overflow-hidden mb-3">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={180}
                    height={270}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#00E5FF]/20 text-[#00E5FF] text-xs rounded-full">
                          {movie.matchPercentage}% match
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white text-black rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                          <Play className="w-3 h-3 inline mr-1" />
                          Play
                        </button>
                        <button className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white/30 transition-colors">
                          <Info className="w-3 h-3 inline mr-1" />
                          Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium line-clamp-2">{movie.title}</h3>
                <p className="text-sm text-gray-400">{movie.year} • {movie.genre}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Micro Categories */}
        <div className="mb-12">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {microCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full border transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Endless Adaptive Feed */}
        <div className="mb-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={180}
                    height={270}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* AI Highlight Badge */}
                  {index % 3 === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#00E5FF]/20 backdrop-blur-sm rounded-full">
                      <span className="text-[#00E5FF] text-xs font-medium">AI Pick</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{movie.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{movie.year}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{movie.description}</p>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{movie.title}</h3>
                <p className="text-xs text-gray-400">{movie.genre}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
