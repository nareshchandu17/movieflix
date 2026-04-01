"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { smartSearch, getSearchSuggestions, debounce } from "@/lib/smartSearch";
import { SearchResult } from "@/lib/smartSearch";

interface EnhancedSearchBarProps {
  onTyping?: (value: string) => void;
  onSearch?: (results: SearchResult[], query: string) => void;
  initialValue?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

const EnhancedSearchBar = ({
  onTyping,
  onSearch,
  initialValue = "",
  placeholder = "Search for movies, TV shows, actors..",
  showSuggestions = true,
  autoFocus = true,
}: EnhancedSearchBarProps) => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);
  const router = useRouter();

  // Debounced search for suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          const suggestionList = await getSearchSuggestions(query);
          setSuggestions(suggestionList);
          setShowSuggestionsDropdown(suggestionList.length > 0);
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          setSuggestions([]);
          setShowSuggestionsDropdown(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestionsDropdown(false);
      }
    }, 300),
    []
  );

  // Update search value when initialValue changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // Auto-focus when component mounts
  useEffect(() => {
    if (autoFocus) {
      searchBarRef.current?.focus();
    }
  }, [autoFocus]);

  // Handle input changes
  const handleTyping = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsLoading(true);
    
    // Get suggestions
    if (showSuggestions) {
      debouncedGetSuggestions(value);
    }
    
    // Notify parent
    if (onTyping) {
      onTyping(value);
    }
    
    setIsLoading(false);
  }, [onTyping, showSuggestions, debouncedGetSuggestions]);

  // Handle search execution
  const handleSearch = useCallback(async (query: string = searchValue) => {
    if (!query.trim()) {
      searchBarRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setShowSuggestionsDropdown(false);
    
    try {
      const results = await smartSearch(query, {
        includeMovies: true,
        includeTV: true,
        maxResults: 20
      });
      
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      
      // Notify parent if callback provided
      if (onSearch) {
        onSearch(results, query);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchValue, onSearch, router]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchValue(suggestion);
    setShowSuggestionsDropdown(false);
    handleSearch(suggestion);
  }, [handleSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestionsDropdown(false);
      searchBarRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      // Focus first suggestion
      const firstSuggestion = suggestionsRef.current?.querySelector('[data-suggestion-item="0"]');
      if (firstSuggestion) {
        (firstSuggestion as HTMLElement).focus();
      }
    }
  }, [handleSearch, suggestions]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (searchValue.length >= 2 && suggestions.length > 0) {
      setShowSuggestionsDropdown(true);
    }
  }, [searchValue, suggestions]);

  // Handle blur
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        setShowSuggestionsDropdown(false);
      }
    }, 150);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
    searchBarRef.current?.focus();
    if (onTyping) {
      onTyping("");
    }
  }, [onTyping]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative max-w-2xl w-full">
      {/* Search Container */}
      <div
        className={`relative flex items-center bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          isFocused
            ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-3">
          <BiSearch
            className={`text-xl transition-colors duration-300 ${
              isFocused ? "text-blue-400" : "text-gray-400"
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={searchBarRef}
          value={searchValue}
          type="text"
          name="search"
          id="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 placeholder:text-sm pr-3 text-base outline-none font-medium"
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          disabled={isLoading}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="px-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Clear Button */}
        {searchValue && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-3 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Clear search"
          >
            <BiX className="text-lg" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="button"
          aria-label="Search"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleSearch()}
          disabled={!searchValue.trim() || isLoading}
        >
          <BiSearch className="text-lg" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsDropdown && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                data-suggestion-item={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-150 flex items-center gap-3 group"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              >
                <BiSearch className="text-gray-500 group-hover:text-blue-400 text-sm" />
                <span className="flex-1 truncate">{suggestion}</span>
                <span className="text-xs text-gray-500">Press Enter</span>
              </button>
            ))}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-700 px-4 py-2">
            <button
              onClick={() => handleSearch()}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Search for "{searchValue}" →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
