"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieDisplay from "@/components/movie/MovieDisplay";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading, PageEmpty } from "@/components/loading/PageLoading";
import { Search, Filter, RotateCcw, ChevronDown, Play, Plus, Info } from "lucide-react";
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const moviesRef = useRef<TMDBMovie[]>([]);
  const currentPageRef = useRef(currentPage);

  // Update ref when currentPage changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasMore(true);
    updateURL(filters, 1, searchQuery);
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
      {/* Search Bar and Filters Section - One Line Layout */}
      <div className="w-full bg-black sticky top-0 z-40 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Bar */}
            <div className="flex-1 min-w-[300px] max-w-[600px]">
              <form onSubmit={handleSearch}>
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  
                  {/* Glow effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
                  
                  {/* Main input with enhanced styling */}
                  <motion.input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`w-full pl-12 pr-16 py-3 bg-gray-900/80 backdrop-blur-md border rounded-full text-white placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm font-medium ${
                      isTyping 
                        ? 'border-blue-400 shadow-lg shadow-blue-400/30 ring-2 ring-blue-400/20' 
                        : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/25'
                    }`}
                    suppressHydrationWarning={true}
                    animate={{
                      borderColor: isTyping ? ['#3B82F6', '#8B5CF6', '#EC4899'] : ['#374151', '#374151', '#374151'],
                    }}
                    transition={{
                      duration: isTyping ? 2 : 0,
                      repeat: isTyping ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Animated typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2 flex gap-1"
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-pink-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Enhanced Search Button */}
                  <motion.button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/60 transition-all duration-300 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Search</span>
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  </motion.button>
                </motion.div>
              </form>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter Pill */}
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFiltersChange({ ...filters, category: e.target.value })}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                  suppressHydrationWarning={true}
                >
                  <option value="popular">Type</option>
                  <option value="popular">Popular</option>
                  <option value="top_rated">Top Rated</option>
                  <option value="now_playing">Now Playing</option>
                  <option value="upcoming">Upcoming</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>

              {/* Genre Filter Pill */}
              <div className="relative">
                <select
                  value={filters.genre}
                  onChange={(e) => handleFiltersChange({ ...filters, genre: e.target.value })}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                  suppressHydrationWarning={true}
                >
                  <option value="">Genre</option>
                  <option value="28">Action</option>
                  <option value="12">Adventure</option>
                  <option value="16">Animation</option>
                  <option value="35">Comedy</option>
                  <option value="80">Crime</option>
                  <option value="99">Documentary</option>
                  <option value="18">Drama</option>
                  <option value="10751">Family</option>
                  <option value="14">Fantasy</option>
                  <option value="36">History</option>
                  <option value="27">Horror</option>
                  <option value="10402">Music</option>
                  <option value="9648">Mystery</option>
                  <option value="10749">Romance</option>
                  <option value="878">Science Fiction</option>
                  <option value="53">Thriller</option>
                  <option value="10752">War</option>
                  <option value="37">Western</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>

              {/* Year Filter Pill */}
              <div className="relative">
                <select
                  value={filters.year}
                  onChange={(e) => handleFiltersChange({ ...filters, year: e.target.value })}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                  suppressHydrationWarning={true}
                >
                  <option value="">Year</option>
                  {Array.from({ length: 30 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>

              {/* Country Filter Pill */}
              <div className="relative">
                <select
                  value={filters.country}
                  onChange={(e) => handleFiltersChange({ ...filters, country: e.target.value })}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                  suppressHydrationWarning={true}
                >
                  <option value="">Country</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="IN">India</option>
                  <option value="CN">China</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>

              {/* Rating Filter Pill */}
              <div className="relative">
                <select
                  value={filters.rating}
                  onChange={(e) => handleFiltersChange({ ...filters, rating: e.target.value })}
                  className="appearance-none bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 pr-7 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                  suppressHydrationWarning={true}
                >
                  <option value="">Rating</option>
                  <option value="9">9+ Stars</option>
                  <option value="8">8+ Stars</option>
                  <option value="7">7+ Stars</option>
                  <option value="6">6+ Stars</option>
                  <option value="5">5+ Stars</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>

              {/* Reset Button Pill */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 text-sm rounded-full hover:scale-105 transition-all"
                suppressHydrationWarning={true}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <PageLoading>Loading movies, please wait...</PageLoading>}

      {/* Movies Display with Infinite Scroll */}
      {!isLoading && movies.length > 0 && (
        <>
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
            {hasMore && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              </div>
            )}
          </div>
          
          {/* Load More Button (fallback) */}
          {hasMore && !isLoadingMore && (
            <div className="w-full py-4 flex justify-center">
              <Button
                onClick={loadMore}
                className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 overflow-hidden group"
              >
                <span className="relative z-10">Load More Movies</span>
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
