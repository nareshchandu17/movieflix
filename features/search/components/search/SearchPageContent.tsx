"use client";
import PremiumSearchDisplay from "@/features/search/components/search/PremiumSearchDisplay";
import SearchSuggestions from "@/features/search/components/search/SearchSuggestions";
import EnhancedSearchBar from "@/features/search/components/search/EnhancedSearchBar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchResult } from "@/features/search/components/search/SmartSearch";
import { api } from "@/lib/api";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import EnhancedMediaCard from "@/features/shared/components/display/EnhancedMediaCard";
import { useSearch } from "@/features/search/components/SearchContext";

type ContentSource = "search" | "none";
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

      {activeSource === "search" ? (
        <PremiumSearchDisplay
          results={displayResults}
          query={query}
          isLoading={isLoading}
          actor={actor}
        />
      ) : (
        <SearchTrendingSection />
      )}
    </>
  );
};

const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsSearching } = useSearch();

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [actorData, setActorData] = useState<any>(null);
  const [typedValue, setTypedValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [activeSource, setActiveSource] = useState<ContentSource>("none");
  const [displayResults, setDisplayResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearSearchState = useCallback(() => {
    setSearchResults([]);
    setActorData(null);
    setSearchError(null);
    setIsFallback(false);
    setActiveSource("none");
    setDisplayResults([]);
    setIsLoading(false);
    setIsSearching(false);
  }, [setIsSearching]);

  const updateUrlQuery = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (query.trim() === "") {
        params.delete("q");
      } else {
        params.set("q", query);
      }
      const newURL = params.toString() ? `/search?${params.toString()}` : "/search";
      router.replace(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  const performSearch = useCallback(
    async (query: string, pushUrl = false) => {
      if (query.trim().length < MIN_SEARCH_LENGTH) {
        clearSearchState();
        if (pushUrl) updateUrlQuery("");
        return;
      }

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      setIsLoading(true);
      setIsSearching(true);
      setSearchError(null);
      setActiveSource("search");
      if (pushUrl) updateUrlQuery(query);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=multi&page=1`);
        if (!response.ok) throw new Error("Search request failed");

        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Search failed");

        const results = data.results || data.data?.results || [];
        const actor = data.actor || data.data?.actor || null;
        const empty = data.empty || data.data?.empty || results.length === 0;

        setSearchResults(results);
        setActorData(actor);
        setDisplayResults(results);
        setIsFallback(empty);

        if (results.length === 0 && !empty && !actor) {
          setSearchError(`No results found for "${query}"`);
          setActiveSource("none");
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchError("Search failed. Please try again.");
        setSearchResults([]);
        setActorData(null);
        setDisplayResults([]);
        setActiveSource("none");
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [clearSearchState, setIsSearching, updateUrlQuery]
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setTypedValue(value);
      setSearchError(null);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(() => {
        if (value.trim().length >= MIN_SEARCH_LENGTH) {
          performSearch(value, true);
        } else {
          clearSearchState();
          updateUrlQuery("");
        }
      }, 300);
    },
    [clearSearchState, performSearch, updateUrlQuery]
  );

  const handleSearchSubmit = useCallback(
    (value: string) => {
      setTypedValue(value);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      performSearch(value, true);
    },
    [performSearch]
  );

  useEffect(() => {
    if (!searchParams) return;
    const query = searchParams.get("q") || "";
    setTypedValue(query);
    if (query.trim().length >= MIN_SEARCH_LENGTH) {
      performSearch(query, false);
    } else {
      clearSearchState();
    }
  }, [clearSearchState, performSearch, searchParams]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const statusMessage = useMemo(() => {
    if (searchError) return searchError;
    if (typedValue.trim().length > 0 && typedValue.trim().length < MIN_SEARCH_LENGTH) {
      return `Type at least ${MIN_SEARCH_LENGTH} characters to search.`;
    }
    if (isLoading) {
      return `Searching for "${typedValue}"...`;
    }
    if (activeSource === "search") {
      if (isFallback) {
        return `No results found for "${typedValue}". Showing trending content instead.`;
      }
      if (searchResults.length > 0) {
        return `Found ${searchResults.length} ranked result(s) for "${typedValue}"`;
      }
    }
    return null;
  }, [activeSource, isFallback, isLoading, searchError, searchResults.length, typedValue]);

  return (
    <div className="container mx-auto px-4 pb-12 mt-4">
      <div className="mb-8 flex justify-center w-full relative">
        <div className="w-full max-w-2xl">
          <EnhancedSearchBar
            onTyping={handleSearchInput}
            onSearch={handleSearchSubmit}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            initialValue={typedValue}
            placeholder="Search movies, TV shows, actors..."
            autoFocus={true}
          />
          <SearchSuggestions 
            query={typedValue} 
            onSelect={handleSearchSubmit} 
            isVisible={isFocused && activeSource !== "search"} 
          />
        </div>
      </div>

      <AsyncResultsSection
        isLoading={isLoading}
        displayResults={displayResults}
        activeSource={activeSource}
        currentError={searchError}
        statusMessage={statusMessage}
        query={typedValue}
        actor={actorData}
      />
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

