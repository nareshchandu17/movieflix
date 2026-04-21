"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieDisplay from "@/components/movie/MovieDisplay";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading, PageEmpty } from "@/components/loading/PageLoading";
import { Search, Filter, RotateCcw, ChevronDown, Play, Plus, Info, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

const EnhancedMoviePageClient = () => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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

  // Rotating placeholders for premium OTT feel
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

  // Genre data for popover
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

  // Country data for popover
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

  // Rating data for popover
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
    }, 3500); // Rotate every 3.5 seconds

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

  // Fetch movies when filters or page changes
  const fetchMovies = useCallback(async (isLoadMore = false, pageOverride?: number) => {
    const actualPage = pageOverride || (isLoadMore ? currentPageRef.current + 1 : 1);
    console.log("[EnhancedMoviePage] fetchMovies called", { isLoadMore, currentPage: currentPageRef.current, actualPage, hasMore, isLoadingMore });
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setMovies([]);
      setCurrentPage(1);
    }

    try {
      console.log("[EnhancedMoviePage] Fetching movies with filters:", {
        filters,
        currentPage: actualPage,
        searchQuery,
      });

      const pageToFetch = actualPage;
      const moviesPerPage = 20; // Standard TMDB page size for infinite scroll
      let allMovies: any[] = [];
      
      // For load more, start with existing movies to avoid duplicates
      if (isLoadMore) {
        allMovies = [...moviesRef.current];
        console.log("[EnhancedMoviePage] Starting with existing movies:", allMovies.length);
      }
      
      // Create seenIds set from existing movies for load more
      const seenIds = new Set(isLoadMore ? moviesRef.current.map(m => m.id) : []);
      console.log("[EnhancedMoviePage] Seen IDs count:", seenIds.size);

      // If there's a search query, use the search API
      if (searchQuery.trim()) {
        const searchResults = await api.search(searchQuery, "movie", pageToFetch);
        
        // Enhanced deduplication for search results
        const uniqueSearchMovies = searchResults.results.filter((movie: any): movie is TMDBMovie => {
          // Only include actual movies, not TV shows
          if (!movie.title || !movie.release_date) {
            console.log(`[EnhancedMoviePage] Skipping non-movie content: ${movie.name || 'Unknown'}`);
            return false;
          }
          
          if (seenIds.has(movie.id)) {
            console.log(`[EnhancedMoviePage] Skipping duplicate movie ID: ${movie.id}`);
            return false;
          }
          seenIds.add(movie.id);
          return true;
        });
        
        allMovies.push(...uniqueSearchMovies);
        console.log(`[EnhancedMoviePage] Added ${uniqueSearchMovies.length} unique search movies`);

        if (isLoadMore) {
          setMovies(prev => {
            const newMovies = [...prev, ...uniqueSearchMovies.filter(m => !prev.some(p => p.id === m.id))];
            moviesRef.current = newMovies;
            console.log(`[EnhancedMoviePage] Total movies after load more: ${newMovies.length}`);
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
        const movieData = await api.getMedia("movie", {
          category: filters.category as
            | "popular"
            | "top_rated"
            | "now_playing"
            | "upcoming",
          page: pageToFetch,
          genre: filters.genre || undefined,
          year: filters.year ? parseInt(filters.year) : undefined,
          sortBy:
            filters.sortBy !== "popularity.desc" ? filters.sortBy : undefined,
        });

        // Enhanced deduplication for regular movie results
        const uniqueMovies = movieData.results.filter((movie: any): movie is TMDBMovie => {
          // Only include actual movies, not TV shows
          if (!movie.title || !movie.release_date) {
            console.log(`[EnhancedMoviePage] Skipping non-movie content: ${movie.name || 'Unknown'}`);
            return false;
          }
          
          if (seenIds.has(movie.id)) {
            console.log(`[EnhancedMoviePage] Skipping duplicate movie ID: ${movie.id}`);
            return false;
          }
          seenIds.add(movie.id);
          return true;
        });
        
        allMovies.push(...uniqueMovies);
        console.log(`[EnhancedMoviePage] Added ${uniqueMovies.length} unique movies from API`);

        if (isLoadMore) {
          setMovies(prev => {
            const newMovies = [...prev, ...uniqueMovies.filter(m => !prev.some(p => p.id === m.id))];
            moviesRef.current = newMovies;
            console.log(`[EnhancedMoviePage] Total movies after load more: ${newMovies.length}`);
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
        setCurrentPage(prev => {
          const newPage = prev + 1;
          console.log("[EnhancedMoviePage] Updated page:", newPage);
          return newPage;
        });
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
      
      console.log(
        `[EnhancedMoviePage] Successfully loaded ${allMovies.length} movies (load more: ${isLoadMore}), final movie count: ${isLoadMore ? moviesRef.current.length : allMovies.length}`
      );
    } catch (error) {
      console.error("[EnhancedMoviePage] Failed to fetch movies:", error);
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

  // Infinite scroll observer - only active in infinite mode
  useEffect(() => {
    if (!hasMore || isLoadingMore || !isInfiniteMode) {
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          console.log("[EnhancedMoviePage] Intersection observer triggered", { currentPage: currentPageRef.current });
          // Fetch the NEXT page
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
  }, [hasMore, isLoadingMore, isInfiniteMode]);

  const loadMore = () => {
    console.log("[EnhancedMoviePage] Load more clicked", { hasMore, isLoadingMore, nextPage: currentPage + 1 });
    if (hasMore && !isLoadingMore) {
      fetchMovies(true, currentPage + 1);
    } else {
      console.log("[EnhancedMoviePage] Cannot load more", { hasMore, isLoadingMore });
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
    setIsInfiniteMode(false); // Reset to manual mode on filter change
    updateURL(newFilters, 1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      setHasMore(true);
      updateURL(filters, 1, searchQuery);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Typing effect
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing effect
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);
    
    setTypingTimeout(newTimeout);
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
    setIsInfiniteMode(false); // Reset to manual mode
    updateURL(defaultFilters, 1, "");
  };



  return (
    <>
      {/* Search Bar and Filters Section - Premium OTT Style */}
      <div className="w-full bg-black sticky top-0 z-40 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Premium Search Bar - No Button */}
            <div className="flex-1 max-w-[45%] min-w-[280px]">
  <motion.div
    className="relative group"
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
  >

    {/* Search Icon */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-gray-400 z-10">
      <Search className="w-5 h-5" />
    </div>

    {/* Premium glow background */}
    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-600/30 to-red-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>

    {/* Search Input */}
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
      onKeyDown={handleSearchKeyDown}
      className={`w-full bg-zinc-900/50 border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:bg-zinc-900 transition-all duration-300 ${
        isTyping ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-zinc-800"
      }`}
    />

    {/* Rotating Placeholder - Restored logic */}
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

    {/* Enter Hint - Restored logic */}
    <AnimatePresence>
      {!searchQuery && !isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold"
        >
          ⏎
        </motion.div>
      )}
    </AnimatePresence>

  </motion.div>
</div>

            {/* Filter Pills - Improved to prevent clipping */}
            <div className="flex flex-wrap items-center gap-3 popover-container">
              {/* Type Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'type' ? null : 'type')}
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

                {/* Type Popover */}
                <AnimatePresence>
                  {activePopover === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-2 z-50"
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

                {/* Genre Popover */}
                <AnimatePresence>
                  {activePopover === 'genre' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-4 z-50"
                    >
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {genres.map((genre) => (
                          <motion.button
                            key={genre.id}
                            onClick={() => {
                              handleFiltersChange({ ...filters, genre: genre.id });
                              setActivePopover(null);
                            }}
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

              {/* Year Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'year' ? null : 'year')}
                  className={`backdrop-blur-md border rounded-full px-4 py-2 text-sm focus:outline-none cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                    filters.year 
                      ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-500/10' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {filters.year && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    <span>{filters.year || 'Year'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePopover === 'year' ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Year Popover */}
                <AnimatePresence>
                  {activePopover === 'year' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-48 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-2 z-50 max-h-64 overflow-y-auto"
                    >
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <motion.button
                            key={year}
                            onClick={() => {
                              handleFiltersChange({ ...filters, year: year.toString() });
                              setActivePopover(null);
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                              filters.year === year.toString()
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-zinc-800'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {filters.year === year.toString() && (
                              <span className="mr-1">✓</span>
                            )}
                            {year}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Country Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'country' ? null : 'country')}
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

                {/* Country Popover */}
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

              {/* Rating Filter Pill */}
              <div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'rating' ? null : 'rating')}
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

                {/* Rating Popover */}
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

              {/* Reset Button Pill - Secondary Outline Style */}
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

      {/* Loading State */}
      {isLoading && <PageLoading>Loading movies, please wait...</PageLoading>}

      {/* Movies Display - Seamless Infinite Scroll */}
      {!isLoading && movies.length > 0 && (
        <div className="mt-8">
          {/* Results Header - Sticky & Dynamic */}
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
              
              {/* Custom Sort Dropdown - Premium Style */}
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hidden sm:block">Sort By:</span>
                <div className="relative group popover-container">
                  <motion.button
                    onClick={() => setActivePopover(activePopover === 'sort' ? null : 'sort')}
                    className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-1.5 text-white text-[11px] font-bold hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>
                      {filters.sortBy === 'popularity.desc' ? 'Popularity' : 
                       filters.sortBy === 'vote_average.desc' ? 'Rating' : 
                       filters.sortBy === 'release_date.desc' ? 'Latest' : 
                       filters.sortBy === 'title.asc' ? 'A-Z' : 'Z-A'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${activePopover === 'sort' ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {activePopover === 'sort' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 w-36 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl p-1 z-50 overflow-hidden"
                      >
                        {[
                          { value: 'popularity.desc', label: 'Popularity' },
                          { value: 'vote_average.desc', label: 'Rating' },
                          { value: 'release_date.desc', label: 'Latest' },
                          { value: 'title.asc', label: 'A-Z' },
                          { value: 'title.desc', label: 'Z-A' }
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              handleFiltersChange({ ...filters, sortBy: option.value });
                              setActivePopover(null);
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-[11px] text-left transition-colors font-medium ${
                              filters.sortBy === option.value
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-zinc-800'
                            }`}
                            whileHover={{ x: 2 }}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
          
          {/* Load More Area - Hybrid Logic */}
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

      {/* Empty State - Improved Messaging */}
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

export default EnhancedMoviePageClient;
