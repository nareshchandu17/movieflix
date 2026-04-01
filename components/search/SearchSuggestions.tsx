"use client";

import { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Clock, Film, Tv, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  text: string;
  type: "recent" | "trending" | "suggestion";
  category?: "movie" | "tv" | "person";
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  isVisible: boolean;
}

const SearchSuggestions = ({ query, onSelect, isVisible }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  // Load trending searches
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await fetch('/api/search/trending');
        if (response.ok) {
          const data = await response.json();
          setTrending(data.trending || []);
        }
      } catch (error) {
        console.error('Failed to load trending searches:', error);
      }
    };

    loadTrending();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const loadRecent = () => {
      try {
        const stored = localStorage.getItem('recent-searches');
        if (stored) {
          const searches = JSON.parse(stored);
          setRecent(searches.slice(0, 5)); // Keep only last 5
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    };

    loadRecent();
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      // Show trending and recent when no query
      const allSuggestions: Suggestion[] = [
        ...recent.map(search => ({
          id: `recent-${search}`,
          text: search,
          type: "recent" as const
        })),
        ...trending.map(search => ({
          id: `trending-${search}`,
          text: search,
          type: "trending" as const
        }))
      ];
      setSuggestions(allSuggestions.slice(0, 8));
      return;
    }

    // Generate autocomplete suggestions
    const generateSuggestions = async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          const suggestionList: Suggestion[] = data.suggestions?.map((suggestion: any) => ({
            id: suggestion.id,
            text: suggestion.text,
            type: "suggestion" as const,
            category: suggestion.category
          })) || [];
          setSuggestions(suggestionList.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(generateSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Add to recent searches
    const updatedRecent = [suggestion.text, ...recent.filter(r => r !== suggestion.text)].slice(0, 5);
    setRecent(updatedRecent);
    localStorage.setItem('recent-searches', JSON.stringify(updatedRecent));
    
    onSelect(suggestion.text);
  };

  const handleTrendingClick = (trendingItem: string) => {
    handleSuggestionClick({
      id: `trending-click-${trendingItem}`,
      text: trendingItem,
      type: 'trending'
    });
  };

  const handleClearRecent = () => {
    setRecent([]);
    localStorage.removeItem('recent-searches');
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 max-h-[400px] overflow-y-auto z-[100]">
      {/* Search Input */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 text-white/60">
          <Search className="w-4 h-4" />
          <span className="text-sm">
            {query ? `Searching for "${query}"` : "Type to search..."}
          </span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-2">
        {suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                {suggestion.type === "recent" && (
                  <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-white/80 text-sm">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 ml-auto">Recent</span>
                  </>
                )}
                {suggestion.type === "trending" && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">{suggestion.text}</span>
                    <span className="text-xs text-green-400 ml-auto">Trending</span>
                  </>
                )}
                {suggestion.type === "suggestion" && (
                  <>
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80 text-sm">{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="text-xs text-gray-500 ml-auto capitalize">
                        {suggestion.category === 'movie' && <Film className="w-3 h-3 inline mr-1" />}
                        {suggestion.category === 'tv' && <Tv className="w-3 h-3 inline mr-1" />}
                        {suggestion.category === 'person' && <User className="w-3 h-3 inline mr-1" />}
                        {suggestion.category}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No suggestions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recent Searches */}
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent</span>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recent.map((search, index) => (
                    <button
                      key={`recent-${index}`}
                      onClick={() => handleTrendingClick(search)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white/60 text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trending.length > 0 && (
              <div>
                <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trending</span>
                </div>
                <div className="space-y-1">
                  {trending.map((trendingItem, index) => (
                    <button
                      key={`trending-${index}`}
                      onClick={() => handleTrendingClick(trendingItem)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                    >
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white/60 text-sm">{trendingItem}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;
