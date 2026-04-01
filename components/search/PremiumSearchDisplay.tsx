"use client";
import React, { useState, useMemo } from "react";
import { SearchResult } from "@/lib/smartSearch";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import EnhancedMediaCard from "@/components/display/EnhancedMediaCard";
import { Play, Star, Calendar, Clock, TrendingUp, Film, Tv, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PremiumSearchDisplayProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
}

const PremiumSearchDisplay: React.FC<PremiumSearchDisplayProps> = ({
  results,
  query,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');

  // Filter results by type
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(result => result._source === activeTab.slice(0, -1)); // 'movies' -> 'movie', 'tv' -> 'tv'
  }, [results, activeTab]);

  // Get top result (highest score)
  const topResult = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((prev, current) => 
      (current._searchScore || 0) > (prev._searchScore || 0) ? current : prev
    );
  }, [results]);

  // Get other results (excluding top)
  const otherResults = useMemo(() => {
    if (!topResult) return results;
    return results.filter(result => result.id !== topResult.id);
  }, [results, topResult]);

  // Count by type
  const counts = useMemo(() => ({
    movies: results.filter(r => r._source === 'movie').length,
    tv: results.filter(r => r._source === 'tv').length,
    total: results.length
  }), [results]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Film className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-gray-400 mb-4">
            We couldn't find anything matching "{query}"
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Check your spelling</p>
            <p>• Try different keywords</p>
            <p>• Use more general terms</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Results for "{query}"
          </h2>
          <p className="text-gray-400">
            Found {counts.total} results 
            {counts.movies > 0 && ` • ${counts.movies} movies`}
            {counts.tv > 0 && ` • ${counts.tv} TV shows`}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'movies'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Movies ({counts.movies})
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'tv'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TV Shows ({counts.tv})
          </button>
        </div>
      </div>

      {/* Top Result (Netflix-style) */}
      {topResult && activeTab === 'all' && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              TOP RESULT
            </div>
            {topResult._isExactMatch && (
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                EXACT MATCH
              </div>
            )}
            {topResult._searchScore && topResult._searchScore > 150 && (
              <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                POPULAR
              </div>
            )}
          </div>
          
          <div className="flex gap-6">
            {/* Top Result Poster */}
            <div className="flex-shrink-0">
              <Link href={topResult._source === 'movie' ? `/movie/${topResult.id}` : `/series/${topResult.id}`}>
                <div className="relative group cursor-pointer">
                  {topResult.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${topResult.poster_path}`}
                      alt={topResult.title || topResult.name || 'Content'}
                      width={240}
                      height={360}
                      className="rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-60 h-90 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-blue-600 rounded-full p-4">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Top Result Details */}
            <div className="flex-1">
              <Link href={topResult._source === 'movie' ? `/movie/${topResult.id}` : `/series/${topResult.id}`}>
                <h3 className="text-3xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">
                  {topResult.title || topResult.name}
                </h3>
              </Link>
              
              <div className="flex items-center gap-4 mb-4 text-gray-300">
                {topResult.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{topResult.vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                {(topResult.release_date || topResult.first_air_date) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(topResult.release_date || topResult.first_air_date || '').getFullYear()}</span>
                  </div>
                )}
                
                {topResult._source && (
                  <div className="flex items-center gap-1">
                    {topResult._source === 'movie' ? (
                      <Film className="w-4 h-4" />
                    ) : (
                      <Tv className="w-4 h-4" />
                    )}
                    <span className="capitalize">{topResult._source}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 line-clamp-3 mb-4">
                {topResult.overview}
              </p>
              
              <div className="flex items-center gap-4">
                <Link
                  href={topResult._source === 'movie' ? `/movie/${topResult.id}` : `/series/${topResult.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Watch Now
                </Link>
                
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  + Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Results Grid */}
      {filteredResults.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            {activeTab === 'all' ? 'Other Results' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredResults.map((result) => (
              <div key={result.id} className="relative group">
                <EnhancedMediaCard
                  media={result as TMDBMovie | TMDBTVShow}
                  className="transform group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Match Type Badge */}
                {result._matchType && (
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    result._matchType === 'exact' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : result._matchType === 'partial'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {result._matchType === 'exact' ? 'Exact' : 
                     result._matchType === 'partial' ? 'Partial' : 'Similar'}
                  </div>
                )}
                
                {/* Score Indicator */}
                {result._searchScore && result._searchScore > 100 && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {Math.round(result._searchScore)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSearchDisplay;
