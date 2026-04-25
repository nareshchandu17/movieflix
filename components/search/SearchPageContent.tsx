"use client";
import PremiumSearchDisplay from "@/components/search/PremiumSearchDisplay";
import FilterWrapper from "@/components/filter/FilterWrapper";
import EnhancedSearchBar from "@/components/search/EnhancedSearchBar";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchResult } from "@/lib/smartSearch";
import { PageLoading } from "../loading/PageLoading";
import { api } from "@/lib/api";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import EnhancedMediaCard from "../display/EnhancedMediaCard";

type ContentSource = "search" | "filter" | "none";
const MIN_SEARCH_LENGTH = 2;

interface AsyncResultsSectionProps {
  isLoading: boolean;
  displayResults: SearchResult[];
  activeSource: ContentSource;
  currentError: string | null;
  statusMessage: string | null;
  query: string;
  actor?: any;
}

const AsyncResultsSection = ({
  isLoading,
  displayResults,
  activeSource,
  currentError,
  statusMessage,
  query,
  actor,
}: AsyncResultsSectionProps) => {
  return (
    <>
      {/* Status Message */}
      {statusMessage && (
        <div className="flex justify-center mb-6">
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currentError
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-red-900/20 text-red-400 border border-red-500/30 backdrop-blur-md"
              }`}
          >
            {statusMessage}
          </div>
        </div>
      )}

      {/* Search Results */}
      {activeSource === "search" && (
        <PremiumSearchDisplay
          results={displayResults}
          query={query}
          isLoading={isLoading}
          actor={actor}
        />
      )}

      {/* Filter Results (existing implementation) */}
      {activeSource === "filter" && (
        <div className="text-center py-16">
          <p className="text-gray-400">Filter results would appear here</p>
        </div>
      )}

      {/* Empty State / Trending */}
      {!isLoading && activeSource === "none" && (
        <SearchTrendingSection />
      )}
    </>
  );
};

const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search-related state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [actorData, setActorData] = useState<any>(null);
  const [typedValue, setTypedValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Filter-related state
  const [filterResults, setFilterResults] = useState<SearchResult[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Display state - determines which results to show
  const [activeSource, setActiveSource] = useState<ContentSource>("none");
  const [displayResults, setDisplayResults] = useState<SearchResult[]>([]);

  /**
   * Initialize search from URL parameters
   */
  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get("q");
      if (query && query.trim() !== "") {
        setTypedValue(query);
        performSearch(query);
      }
    }
  }, [searchParams]);

  /**
   * Perform smart search
   */
  const performSearch = async (query: string) => {
    if (query.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setActorData(null);
      setSearchError(null);
      setActiveSource((prev) => (prev === "search" ? "none" : prev));
      setDisplayResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Use our enhanced API endpoint for smart search
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&maxResults=50`);

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        setActorData(data.actor || null);
        setIsFallback(!!data.empty);
        setActiveSource("search");
        setDisplayResults(data.results);

        if (data.results.length === 0 && !data.empty && !data.actor) {
          setSearchError(`No results found for "${query}"`);
        }
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Search failed. Please try again.");
      setSearchResults([]);
      setActiveSource((prev) => (prev === "search" ? "none" : prev));
      setDisplayResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle search input changes
   */
  const handleSearchInput = (value: string) => {
    setTypedValue(value);
    // Update URL if search query has 2+ characters or is empty (for clearing)
    if (value.trim().length >= MIN_SEARCH_LENGTH || value.trim().length === 0) {
      updateSearchURL(value);
    }
  };

  /**
   * Update URL when search value changes
   */
  const updateSearchURL = (query: string) => {
    if (!searchParams) return;

    const params = new URLSearchParams(searchParams.toString());
    if (query.trim() === "") {
      params.delete("q");
    } else {
      params.set("q", query);
    }

    const newURL = params.toString()
      ? `/search?${params.toString()}`
      : "/search";
    router.push(newURL, { scroll: false });
  };

  /**
   * Handle filter results from FilterWrapper
   */
  const handleFilterResults = (results: SearchResult[]) => {
    setFilterResults(results);
    setActiveSource("filter");
    setDisplayResults(results);
  };

  /**
   * Handle filter loading state
   */
  const handleFilterLoading = (isLoading: boolean) => {
    setIsFiltering(isLoading);
  };

  /**
   * Handle filter errors
   */
  const handleFilterError = (error: string | null) => {
    setFilterError(error);
  };

  /**
   * Determine loading state based on active source
   */
  const isLoading = activeSource === "search" ? isSearching : isFiltering;

  /**
   * Determine error message based on active source
   */
  const currentError = activeSource === "search" ? searchError : filterError;

  /**
   * Compute status message once in parent
   */
  const statusMessage: string | null = (() => {
    if (currentError) return currentError;

    if (activeSource === "search" && searchResults.length > 0) {
      if (isFallback) {
        return `No results found for "${typedValue}". Showing trending content instead.`;
      }
      return `Found ${searchResults.length} ranked result(s) for "${typedValue}"`;
    }

    if (activeSource === "filter" && filterResults.length > 0) {
      return `Discovered ${filterResults.length} content item(s)`;
    }

    return null;
  })();

  return (
    <div className="container mx-auto px-4 pb-12">
      {/* Enhanced Search Bar Section */}
      <div className="mb-8 flex justify-center w-full">
        <EnhancedSearchBar
          onTyping={handleSearchInput}
          initialValue={typedValue}
          placeholder="Search movies, TV shows, actors..."
          showSuggestions={true}
          autoFocus={true}
        />
      </div>

      {/* Filter Section - Static wrapper, async content inside */}
      <FilterWrapper
        onResultsChange={handleFilterResults}
        onLoadingChange={handleFilterLoading}
        onErrorChange={handleFilterError}
      />

      {/* Async content section with its own Suspense boundary */}
      <Suspense fallback={<PageLoading>Loading content...</PageLoading>}>
        <AsyncResultsSection
          isLoading={isLoading}
          displayResults={displayResults}
          activeSource={activeSource}
          currentError={currentError}
          statusMessage={statusMessage}
          query={typedValue}
          actor={actorData}
        />
      </Suspense>
    </div>
  );
};

export default SearchPageContent;

const SearchTrendingSection = () => {
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const [moviesRes, seriesRes] = await Promise.all([
          api.getTrending("movie", "day"),
          api.getTrending("tv", "day"),
        ]);
        
        // Take top 6 items
        setTrendingMovies(moviesRes.results.slice(0, 6) as TMDBMovie[]);
        setTrendingSeries(seriesRes.results.slice(0, 6) as TMDBTVShow[]);
      } catch (error) {
        console.error("Failed to load trending content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-12 w-full mt-8 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-gray-800 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 w-full mt-4">
      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-red-500">🎬</span> Trending Movies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingMovies.map((movie) => (
              <EnhancedMediaCard key={movie.id} media={movie} variant="grid" />
            ))}
          </div>
        </div>
      )}

      {/* Trending Series */}
      {trendingSeries.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-500">📺</span> Trending Series
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingSeries.map((series) => (
              <EnhancedMediaCard key={series.id} media={series} variant="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
