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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
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
    const actualPage = pageOverride || (isLoadMore ? currentPage : 1);
    console.log("[EnhancedMoviePage] fetchMovies called", { isLoadMore, currentPage, actualPage, hasMore, isLoadingMore });
    
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

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          console.log("[EnhancedMoviePage] Intersection observer triggered");
          fetchMovies(true, currentPageRef.current);
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
  }, [hasMore, isLoadingMore]);

  const loadMore = () => {
    console.log("[EnhancedMoviePage] Load more clicked", { hasMore, isLoadingMore, currentPage });
    if (hasMore && !isLoadingMore) {
      fetchMovies(true, currentPage);
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
      type="text"
      placeholder=""
      value={searchQuery}
      onChange={handleSearchChange}
      onKeyDown={handleSearchKeyDown}
      suppressHydrationWarning
      className={`w-full pl-12 pr-20 py-3 bg-black border rounded-full text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm font-medium ${
        isTyping
          ? "border-blue-400 shadow-lg shadow-blue-400/30 ring-2 ring-blue-400/20"
          : "border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/25"
      }`}
      animate={{
        borderColor: isTyping
          ? ["#3B82F6", "#8B5CF6", "#EC4899"]
          : ["#374151", "#374151", "#374151"],
      }}
      transition={{
        duration: isTyping ? 2 : 0,
        repeat: isTyping ? Infinity : 0,
        ease: "easeInOut",
      }}
    />

    {/* Rotating Placeholder */}
    <AnimatePresence mode="wait">
      {!searchQuery && !isTyping && (
        <motion.div
          key={placeholderIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="absolute left-12 right-20 top-0 bottom-0 flex items-center pointer-events-none text-gray-400 text-sm font-medium"
        >
          {placeholders[placeholderIndex]}
        </motion.div>
      )}
    </AnimatePresence>

    
    {/* Enter Hint */}
    <AnimatePresence>
      {!searchQuery && !isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none"
        >
          ⏎
        </motion.div>
      )}
    </AnimatePresence>

  </motion.div>
</div>

            {/* Filter Pills */}
            <div className="flex items-center gap-3 flex-wrap popover-container">
              {/* Type Filter Pill */}
              <div className="relative">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'type' ? null : 'type')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{filters.category === 'popular' ? 'Type' : filters.category === 'top_rated' ? 'Top Rated' : filters.category === 'now_playing' ? 'Now Playing' : 'Upcoming'}</span>
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
              <div className="relative">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'genre' ? null : 'genre')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{filters.genre ? getGenreName(filters.genre) : 'Genre'}</span>
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
              <div className="relative">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'year' ? null : 'year')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{filters.year || 'Year'}</span>
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
              <div className="relative">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'country' ? null : 'country')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{filters.country ? getCountryName(filters.country) : 'Country'}</span>
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
              <div className="relative">
                <motion.button
                  onClick={() => setActivePopover(activePopover === 'rating' ? null : 'rating')}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{filters.rating ? getRatingName(filters.rating) : 'Rating'}</span>
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

              {/* Reset Button Pill */}
              <motion.button
                onClick={handleReset}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 hover:text-white px-4 py-2 text-sm rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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

      {/* Movies Display with Infinite Scroll */}
      {!isLoading && movies.length > 0 && (
        <>
          {/* Results Header */}
          <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                All Movies <span className="text-gray-400 font-normal">({movies.length} results)</span>
              </h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                className="appearance-none bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 pr-8 text-white text-sm focus:outline-none focus:border-white/40 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/10"
                suppressHydrationWarning={true}
              >
                <option value="popularity.desc" className="bg-gray-800">Sort: Popularity</option>
                <option value="vote_average.desc" className="bg-gray-800">Sort: Rating</option>
                <option value="release_date.desc" className="bg-gray-800">Sort: Release Date</option>
                <option value="title.asc" className="bg-gray-800">Sort: A-Z</option>
                <option value="title.desc" className="bg-gray-800">Sort: Z-A</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
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
          
          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
            {/* Empty - dots removed */}
          </div>
          
          {/* Load More Button (fallback) */}
          {hasMore && !isLoadingMore && (
            <div className="w-full py-4 flex justify-center">
              <Button
                onClick={loadMore}
                className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 overflow-hidden group"
              >
                <span className="relative z-10">Load More</span>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Shadow effect */}
                <div className="absolute inset-0 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/60 transition-shadow duration-300"></div>
              </Button>
            </div>
          )}
          
          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="w-full py-4 flex justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading more movies...</span>
              </div>
            </div>
          )}
          
          {/* End of Results */}
          {!hasMore && movies.length > 0 && (
            <div className="w-full py-8 text-center text-gray-500">
              <p>You've reached the end of the catalog</p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <PageEmpty>No movies found</PageEmpty>
      )}
    </>
  );
};

export default EnhancedMoviePageClient;
