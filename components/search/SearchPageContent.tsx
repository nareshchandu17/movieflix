"use client";
import PremiumSearchDisplay from "@/components/search/PremiumSearchDisplay";
import FilterWrapper from "@/components/filter/FilterWrapper";
import EnhancedSearchBar from "@/components/search/EnhancedSearchBar";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchResult } from "@/lib/smartSearch";
import { PageLoading } from "../loading/PageLoading";

type ContentSource = "search" | "filter" | "none";
const MIN_SEARCH_LENGTH = 2;

interface AsyncResultsSectionProps {
  isLoading: boolean;
  displayResults: SearchResult[];
  activeSource: ContentSource;
  currentError: string | null;
  statusMessage: string | null;
  query: string;
}

const AsyncResultsSection = ({
  isLoading,
  displayResults,
  activeSource,
  currentError,
  statusMessage,
  query,
}: AsyncResultsSectionProps) => {
  return (
    <>
      {/* Status Message */}
      {statusMessage && (
        <div className="flex justify-center mb-6">
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              currentError
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-blue-900/50 text-blue-300 border border-blue-700"
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
        />
      )}

      {/* Filter Results (existing implementation) */}
      {activeSource === "filter" && (
        <div className="text-center py-16">
          <p className="text-gray-400">Filter results would appear here</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activeSource === "none" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 text-lg mb-2">
            Ready to discover amazing content?
          </div>
          <div className="text-gray-500 text-sm">
            Use the enhanced search bar above or apply filters to find movies and TV shows
          </div>
        </div>
      )}
    </>
  );
};

const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search-related state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [typedValue, setTypedValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
        setActiveSource("search");
        setDisplayResults(data.results);

        if (data.results.length === 0) {
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
      <div className="mb-8">
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
        />
      </Suspense>
    </div>
  );
};

export default SearchPageContent;
