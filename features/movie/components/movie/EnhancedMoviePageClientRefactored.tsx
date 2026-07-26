"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieDisplay from "@/features/movie/components/movie/MovieDisplay";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading } from "@/features/shared/components/loading/PageLoading";
import { Search, RotateCcw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ContentEngine from "@/services/content-engine";
import MovieCarousel from "@/features/shared/components/display/MovieCarousel";

interface MovieFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
  type: string;
  country: string;
  rating: string;
  network?: string;
}

const EnhancedMoviePageClientRefactored = () => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const moviesRef = useRef<TMDBMovie[]>([]);
  const currentPageRef = useRef(currentPage);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Rotating placeholders
  const placeholders = [
    "Search movies, actors, genres...",
    "Search 'Avatar'...",
    "Search action movies...",
    "Search Tom Cruise...",
    "Search sci-fi movies...",
    "Search Marvel movies...",
    "Search horror films...",
    "Search comedy movies...",
    "Search 2024 releases..."
  ];

  // Genre data
  const genres = [
    { id: "28", name: "Action" },
    { id: "12", name: "Adventure" },
    { id: "16", name: "Animation" },
    { id: "35", name: "Comedy" },
    { id: "80", name: "Crime" },
    { id: "99", name: "Documentary" },
    { id: "18", name: "Drama" },
    { id: "10751", name: "Family" },
    { id: "14", name: "Fantasy" },
    { id: "36", name: "History" },
    { id: "27", name: "Horror" },
    { id: "10402", name: "Music" },
    { id: "9648", name: "Mystery" },
    { id: "10749", name: "Romance" },
    { id: "878", name: "Science Fiction" },
    { id: "53", name: "Thriller" },
    { id: "10752", name: "War" },
    { id: "37", name: "Western" }
  ];

  // Country data
  const countries = [
    { id: "US", name: "United States" },
    { id: "GB", name: "United Kingdom" },
    { id: "CA", name: "Canada" },
    { id: "AU", name: "Australia" },
    { id: "DE", name: "Germany" },
    { id: "FR", name: "France" },
    { id: "JP", name: "Japan" },
    { id: "KR", name: "South Korea" },
    { id: "IN", name: "India" },
    { id: "CN", name: "China" },
    { id: "IT", name: "Italy" },
    { id: "ES", name: "Spain" },
    { id: "MX", name: "Mexico" },
    { id: "BR", name: "Brazil" },
    { id: "RU", name: "Russia" }
  ];

  // Rating data
  const ratings = [
    { id: "9", name: "9+ Stars" },
    { id: "8", name: "8+ Stars" },
    { id: "7", name: "7+ Stars" },
    { id: "6", name: "6+ Stars" },
    { id: "5", name: "5+ Stars" }
  ];

  // Helper functions
  const getGenreName = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : "Genre";
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : "Country";
  };

  const getRatingName = (ratingId: string) => {
    const rating = ratings.find(r => r.id === ratingId);
    return rating ? rating.name : "Rating";
  };

  const closePopover = () => setActivePopover(null);

  // Update ref when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Rotating placeholder effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.popover-container')) {
        setActivePopover(null);
      }
    };

    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activePopover]);

  const [filters, setFilters] = useState<MovieFiltersData>({
    category: "popular",
    genre: "",
    year: "",
    sortBy: "popularity.desc",
    type: "all",
    country: "",
    rating: "",
    network: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  useEffect(() => {
    if (!searchParams) return;
    
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "popular";
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const sortBy = searchParams.get("sort") || "popularity.desc";
    const type = searchParams.get("type") || "all";
    const country = searchParams.get("country") || "";
    const rating = searchParams.get("rating") || "";
    const search = searchParams.get("search") || "";
    const network = searchParams.get("network") || "";

    setCurrentPage(page);
    setFilters({ category, genre, year, sortBy, type, country, rating, network });
    setSearchQuery(search);
  }, [searchParams]);

  // Fetch movies when filters or page changes with proper cancellation
  const fetchMovies = useCallback(async (isLoadMore = false, pageOverride?: number) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const actualPage = pageOverride || (isLoadMore ? currentPageRef.current + 1 : 1);
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setMovies([]);
      setCurrentPage(1);
    }

    try {
      const pageToFetch = actualPage;
      const moviesPerPage = 20;
      let allMovies: TMDBMovie[] = [];
      
      // For load more, start with existing movies to avoid duplicates
      if (isLoadMore) {
        allMovies = [...moviesRef.current];
      }
      
      // Create seenIds set from existing movies for load more
      const seenIds = new Set(isLoadMore ? moviesRef.current.map(m => m.id) : []);

      // If there's a search query, use the search API
      if (searchQuery.trim()) {
        const searchResults = await api.search(searchQuery, "movie", pageToFetch);
        
        // Enhanced deduplication for search results
        const uniqueSearchMovies = searchResults.results.filter((movie: TMDBMovie) => {
          // Only include actual movies, not TV shows
          if (!movie.title || !movie.release_date) {
            return false;
          }
          
          if (seenIds.has(movie.id)) {
            return false;
          }
          seenIds.add(movie.id);
          return true;
        });
        
        const normalizedSearch = ContentEngine.normalizer.normalizePool(uniqueSearchMovies, "movie");
        const filteredSearch = ContentEngine.qualityFilter.filterPool(normalizedSearch, { minRating: 6.0 });
        const rankedSearch = ContentEngine.rankingEngine.rankPool(filteredSearch, {
          sortStrategy: filters.sortBy === "vote_average.desc" ? "rating" : "score",
        });
        const processedSearchMovies = rankedSearch.map((item) => item.raw || item) as TMDBMovie[];

        allMovies.push(...processedSearchMovies);

        if (isLoadMore) {
          setMovies(prev => {
            const newMovies = [...prev, ...processedSearchMovies.filter(m => !prev.some(p => p.id === m.id))];
            moviesRef.current = newMovies;
            return newMovies;
          });
        } else {
          setMovies(allMovies);
          moviesRef.current = allMovies;
        }
        
        setHasMore(pageToFetch < Math.min(searchResults.total_pages, 500));
        setTotalPages(Math.min(searchResults.total_pages, 500));
      } else {
        // Regular movie fetching without search
        let movieData: { results: any[]; total_pages?: number } = { results: [] };
        
        let effectiveSortBy = filters.sortBy !== "popularity.desc" ? filters.sortBy : undefined;
        if (filters.category === "top_rated" && !effectiveSortBy) {
          effectiveSortBy = "vote_average.desc";
        }

        if (filters.country) {
          // Use discover API for specific country filtering
          movieData = await api.discover("movie", {
            page: pageToFetch,
            genre: filters.genre || undefined,
            year: filters.year ? parseInt(filters.year) : undefined,
            sortBy: effectiveSortBy,
            minRating: filters.rating ? parseInt(filters.rating) : undefined,
            language: filters.country,
          });
        } else {
          // Blended allocation: 60% Telugu, 20% English, 20% Hindi
          const baseParams = {
            page: pageToFetch,
            genre: filters.genre || undefined,
            year: filters.year ? parseInt(filters.year) : undefined,
            sortBy: effectiveSortBy,
            minRating: filters.rating ? parseInt(filters.rating) : undefined,
          };
          
          const [teRes, enRes, hiRes] = await Promise.all([
            api.discover("movie", { ...baseParams, language: "te" }),
            api.discover("movie", { ...baseParams, language: "en" }),
            api.discover("movie", { ...baseParams, language: "hi" }),
          ]);
          
          const teMovies = teRes.results.slice(0, 18);
          const enMovies = enRes.results.slice(0, 6);
          const hiMovies = hiRes.results.slice(0, 6);
          
          const blendedResults: any[] = [];
          let t = 0, e = 0, h = 0;
          for (let i = 0; i < 6; i++) {
            if (t < teMovies.length) blendedResults.push(teMovies[t++]);
            if (t < teMovies.length) blendedResults.push(teMovies[t++]);
            if (t < teMovies.length) blendedResults.push(teMovies[t++]);
            if (e < enMovies.length) blendedResults.push(enMovies[e++]);
            if (h < hiMovies.length) blendedResults.push(hiMovies[h++]);
          }
          
          // Add remaining if we didn't hit perfectly
          while (t < teMovies.length) blendedResults.push(teMovies[t++]);
          while (e < enMovies.length) blendedResults.push(enMovies[e++]);
          while (h < hiMovies.length) blendedResults.push(hiMovies[h++]);
          
          movieData = { results: blendedResults, total_pages: 500 };
        }

        // Enhanced deduplication for regular movie results
        const uniqueMovies = movieData.results.filter((movie: TMDBMovie) => {
          // Only include actual movies, not TV shows
          if (!movie.title || !movie.release_date) {
            return false;
          }
          
          if (seenIds.has(movie.id)) {
            return false;
          }
          seenIds.add(movie.id);
          return true;
        });
        
        const normalizedMovies = ContentEngine.normalizer.normalizePool(uniqueMovies, "movie");
        const filteredMovies = ContentEngine.qualityFilter.filterPool(normalizedMovies, { 
          minRating: filters.rating ? parseInt(filters.rating) : 6.0 
        });
        const rankedMovies = ContentEngine.rankingEngine.rankPool(filteredMovies, {
          sortStrategy: filters.sortBy === "vote_average.desc" ? "rating" : filters.sortBy === "primary_release_date.desc" ? "recency" : "score",
        });
        const processedMovies = rankedMovies.map((item) => item.raw || item) as TMDBMovie[];

        allMovies.push(...processedMovies);

        if (isLoadMore) {
          setMovies(prev => {
            const newMovies = [...prev, ...processedMovies.filter(m => !prev.some(p => p.id === m.id))];
            moviesRef.current = newMovies;
            return newMovies;
          });
        } else {
          setMovies(allMovies);
          moviesRef.current = allMovies;
        }
        
        setHasMore(pageToFetch < 500);
        setTotalPages(500);
      }
      
      if (isLoadMore) {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      // Don't log to console in production
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to fetch movies:", error);
      }
      
      if (!isLoadMore) {
        setMovies([]);
        setTotalPages(1);
      }
      setHasMore(false);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Infinite scroll observer - simplified logic
  useEffect(() => {
    if (!hasMore || isLoadingMore || !isInfiniteMode) {
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchMovies(true, currentPageRef.current + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isInfiniteMode, fetchMovies]);

  const loadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchMovies(true, currentPage + 1);
    }
  };

  const updateURL = (
    newFilters: Partial<MovieFiltersData>,
    newPage?: number,
    newSearch?: string
  ) => {
    const params = new URLSearchParams();
    const page = newPage || currentPage;
    const updatedFilters = { ...filters, ...newFilters };
    const search = newSearch !== undefined ? newSearch : searchQuery;

    if (page > 1) params.set("page", page.toString());
    if (updatedFilters.category !== "popular")
      params.set("category", updatedFilters.category);
    if (updatedFilters.genre) params.set("genre", updatedFilters.genre);
    if (updatedFilters.year) params.set("year", updatedFilters.year);
    if (updatedFilters.sortBy !== "popularity.desc")
      params.set("sort", updatedFilters.sortBy);
    if (updatedFilters.type !== "all") params.set("type", updatedFilters.type);
    if (updatedFilters.country) params.set("country", updatedFilters.country);
    if (updatedFilters.rating) params.set("rating", updatedFilters.rating);
    if (updatedFilters.network) params.set("network", updatedFilters.network);
    if (search) params.set("search", search);

    const newURL = params.toString() ? `/movie?${params.toString()}` : "/movie";
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: MovieFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
    setIsInfiniteMode(false);
    updateURL(newFilters, 1);
  };

  // Debounced search with real-time filtering
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Typing effect
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      // Trigger search automatically after debounce
      updateURL(filters, 1, value);
    }, 500); // 500ms debounce
    
    setTypingTimeout(newTimeout);
  };

  // Keyboard navigation for popovers
  const handleKeyDown = (e: React.KeyboardEvent, popoverType: string) => {
    if (e.key === 'Escape') {
      setActivePopover(null);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActivePopover(activePopover === popoverType ? null : popoverType);
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      category: "popular",
      genre: "",
      year: "",
      sortBy: "popularity.desc",
      type: "all",
      country: "",
      rating: "",
      network: "",
    };
    setFilters(defaultFilters);
    setSearchQuery("");
    setCurrentPage(1);
    setIsInfiniteMode(false);
    updateURL(defaultFilters, 1, "");
  };

  return (
    <>
      {/* Page Title Section */}
      <div className="flex flex-col items-center justify-center space-y-2 pb-8 pt-4 px-4 bg-transparent">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-bold tracking-tight">
          All <span className="text-red-500">Movies</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg md:text-xl text-center max-w-2xl font-medium">
          Browse our entire collection
        </p>
      </div>

      {/* Search Bar and Filters Section */}
      <div className="w-full bg-black/95 backdrop-blur-sm sticky top-[64px] lg:top-[80px] z-40 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Bar */}
            <div className="flex-1 max-w-[45%] min-w-[280px]">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-gray-400 z-10">
                  <Search className="w-5 h-5" />
                </div>

                <motion.input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsTyping(true);
                    setActivePopover(null);
                  }}
                  onBlur={() => setIsTyping(false)}
                  aria-label="Search movies"
                  className={`w-full bg-zinc-900/50 border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:bg-zinc-900 transition-all duration-300 ${
                    isTyping ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-zinc-800"
                  }`}
                />

                <AnimatePresence mode="wait">
                  {!searchQuery && !isTyping && (
                    <motion.div
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-12 right-20 top-0 bottom-0 flex items-center pointer-events-none text-gray-500 text-sm font-medium italic"
                    >
                      {placeholders[placeholderIndex]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 popover-container">
              {/* Type Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'type' ? null : 'type')}
                  onKeyDown={(e) => handleKeyDown(e, 'type')}
                  aria-label={`Filter by type${filters.category !== 'popular' ? `: ${filters.category}` : ''}`}
                  aria-expanded={activePopover === 'type'}
                  aria-haspopup="true"
                  role="combobox"
                  className={`backdrop-blur-md border rounded-full px-4 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    filters.category !== 'popular' 
                      ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {filters.category !== 'popular' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{filters.category === 'popular' ? 'Type' : filters.category === 'top_rated' ? 'Top Rated' : filters.category === 'now_playing' ? 'Now Playing' : 'Upcoming'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePopover === 'type' ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {activePopover === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-2 z-50"
                      role="listbox"
                      aria-label="Movie type options"
                    >
                      {[
                        { value: 'popular', label: 'Popular' },
                        { value: 'top_rated', label: 'Top Rated' },
                        { value: 'now_playing', label: 'Now Playing' },
                        { value: 'upcoming', label: 'Upcoming' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => {
                            handleFiltersChange({ ...filters, category: option.value });
                            setActivePopover(null);
                          }}
                          role="option"
                          aria-selected={filters.category === option.value}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            filters.category === option.value
                              ? 'bg-red-600 text-white'
                              : 'text-gray-300 hover:bg-zinc-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Genre Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'genre' ? null : 'genre')}
                  onKeyDown={(e) => handleKeyDown(e, 'genre')}
                  aria-label={`Filter by genre${filters.genre ? `: ${getGenreName(filters.genre)}` : ''}`}
                  aria-expanded={activePopover === 'genre'}
                  aria-haspopup="true"
                  role="combobox"
                  className={`backdrop-blur-md border rounded-full px-4 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    filters.genre 
                      ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {filters.genre && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{filters.genre ? getGenreName(filters.genre) : 'Genre'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePopover === 'genre' ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {activePopover === 'genre' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-4 z-50"
                      role="listbox"
                      aria-label="Movie genre options"
                    >
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {genres.map((genre) => (
                          <motion.button
                            key={genre.id}
                            onClick={() => {
                              handleFiltersChange({ ...filters, genre: genre.id });
                              setActivePopover(null);
                            }}
                            role="option"
                            aria-selected={filters.genre === genre.id}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              filters.genre === genre.id
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-zinc-800'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {filters.genre === genre.id && (
                              <span className="mr-1">✓</span>
                            )}
                            {genre.name}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Country Filter Pill - Now Functional */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'country' ? null : 'country')}
                  onKeyDown={(e) => handleKeyDown(e, 'country')}
                  aria-label={`Filter by country${filters.country ? `: ${getCountryName(filters.country)}` : ''}`}
                  aria-expanded={activePopover === 'country'}
                  aria-haspopup="true"
                  role="combobox"
                  className={`backdrop-blur-md border rounded-full px-4 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    filters.country 
                      ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {filters.country && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{filters.country ? getCountryName(filters.country) : 'Country'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePopover === 'country' ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {activePopover === 'country' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-2 z-50 max-h-64 overflow-y-auto"
                    >
                      {countries.map((country) => (
                        <motion.button
                          key={country.id}
                          onClick={() => {
                            handleFiltersChange({ ...filters, country: country.id });
                            setActivePopover(null);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            filters.country === country.id
                              ? 'bg-red-600 text-white'
                              : 'text-gray-300 hover:bg-zinc-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {filters.country === country.id && (
                            <span className="mr-1">✓</span>
                          )}
                          {country.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rating Filter Pill - Now Functional */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'rating' ? null : 'rating')}
                  onKeyDown={(e) => handleKeyDown(e, 'rating')}
                  aria-label={`Filter by rating${filters.rating ? `: ${getRatingName(filters.rating)}` : ''}`}
                  aria-expanded={activePopover === 'rating'}
                  aria-haspopup="true"
                  role="combobox"
                  className={`backdrop-blur-md border rounded-full px-4 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    filters.rating 
                      ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {filters.rating && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{filters.rating ? getRatingName(filters.rating) : 'Rating'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePopover === 'rating' ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {activePopover === 'rating' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-40 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-2 z-50"
                    >
                      {ratings.map((rating) => (
                        <motion.button
                          key={rating.id}
                          onClick={() => {
                            handleFiltersChange({ ...filters, rating: rating.id });
                            setActivePopover(null);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                            filters.rating === rating.id
                              ? 'bg-red-600 text-white'
                              : 'text-gray-300 hover:bg-zinc-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {filters.rating === rating.id && (
                            <span className="mr-1">✓</span>
                          )}
                          {rating.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reset Button */}
              <motion.button
                onClick={handleReset}
                className="flex-shrink-0 border border-zinc-700 text-zinc-400 hover:border-red-500 hover:text-red-500 px-5 py-2 text-xs rounded-full transition-all duration-300 flex items-center gap-2 font-bold uppercase tracking-wider bg-transparent"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* No Carousels - Display only movie grid */}
      {/* Loading State */}
      {isLoading && <PageLoading>Loading movies, please wait...</PageLoading>}

      {/* Movies Display */}
      {!isLoading && movies.length > 0 && (
        <div className="mt-8">
          <div className="sticky top-[72px] z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50 mb-6 py-4 shadow-2xl">
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {searchQuery ? "Search Results" : "Discovery"}
                  </h2>
                  <div className="h-4 w-[1px] bg-zinc-700 mx-1" />
                  <span className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                    {movies.length} {movies.length === 1 ? 'Title' : 'Titles'}
                  </span>
                </div>
                {searchQuery && (
                  <p className="text-zinc-500 text-xs italic">
                    Showing results for <span className="text-red-500 font-bold">"{searchQuery}"</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <MovieDisplay
            movies={movies}
            pageid={currentPage.toString()}
            totalPages={totalPages}
            hoveredMovieId={hoveredMovieId}
            setHoveredMovieId={setHoveredMovieId}
            infiniteScroll={true}
          />
          
          {/* Load More Area */}
          <div ref={loadMoreRef} className="w-full py-16 flex flex-col justify-center items-center">
            {isLoadingMore ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-red-600 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  Loading the next reel...
                </span>
              </div>
            ) : !hasMore ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-[1px] bg-zinc-800" />
                <p className="text-zinc-500 text-[11px] font-medium italic">
                  That's all for now. You've reached the end of the collection.
                </p>
                <div className="w-12 h-[1px] bg-zinc-800" />
              </div>
            ) : !isInfiniteMode ? (
              <motion.button
                onClick={() => {
                  loadMore();
                  setIsInfiniteMode(true);
                }}
                className="group relative px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all duration-300 shadow-xl shadow-red-600/20 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-white/20 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex items-center gap-2">
                  <span>Load More Movies</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                </div>
              </motion.button>
            ) : null}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-12 rounded-[2rem] max-w-md shadow-2xl"
          >
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No movies match your criteria</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              We couldn't find any titles fitting these specific filters. Try adjusting your search or resetting the view.
            </p>
            <motion.button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg shadow-red-600/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default EnhancedMoviePageClientRefactored;
