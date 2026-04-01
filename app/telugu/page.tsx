"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { teluguApi, TeluguMovie } from "@/lib/teluguApi";
import { Star, Calendar, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TeluguCollectionPage = () => {
  const [teluguMovies, setTeluguMovies] = useState<TeluguMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedCount, setDisplayedCount] = useState(40); // Initial load 40 movies
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMovies = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      
      const movies = await teluguApi.fetchTeluguMovies(1000);
      setTeluguMovies(movies);
      
      // Check if we have more movies to display
      setHasMore(movies.length > displayedCount);
    } catch (err) {
      console.error("Error fetching Telugu movies:", err);
      setError("Failed to load Telugu movies");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [displayedCount]);

  useEffect(() => {
    loadMovies(true);
  }, [loadMovies]);

  const loadMoreMovies = useCallback(() => {
    const newCount = Math.min(displayedCount + 20, teluguMovies.length);
    setDisplayedCount(newCount);
    setHasMore(newCount < teluguMovies.length);
  }, [displayedCount, teluguMovies.length]);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore) {
          loadMoreMovies();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, loadMoreMovies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#0B0B0F]">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Telugu Collection</h1>
            <p className="text-gray-400">Loading premium Telugu cinema...</p>
          </div>
          
          {/* Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Telugu Collection</h1>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => loadMovies(true)}
            className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayedMovies = teluguMovies.slice(0, displayedCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a1a2e] to-[#0B0B0F]">
      {/* Cinematic background effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Telugu Collection
          </h1>
          <p className="text-gray-400 text-lg">
            {teluguMovies.length}+ Premium Telugu movies from 2026 to classic cinema
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
          {displayedMovies.map((movie, index) => (
            <div 
              key={movie.id}
              className="group relative transform transition-all duration-500 hover:scale-105 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 shadow-2xl">
                {/* Movie image */}
                <div className="relative w-full h-full">
                  {movie.backdropUrl ? (
                    <Image
                      src={movie.backdropUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                      loading="lazy"
                    />
                  ) : movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.66vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-gray-600 text-center p-4">
                        <div className="text-3xl mb-2">🎬</div>
                        <div className="text-xs">No Image</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover overlay with details */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{movie.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Glassmorphism glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-xl backdrop-blur-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Trigger */}
        {hasMore && (
          <div 
            ref={loadMoreRef}
            className="flex justify-center py-8"
          >
            {loadingMore ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">Loading more movies...</span>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                Scroll for more movies
              </div>
            )}
          </div>
        )}

        {/* End message */}
        {!hasMore && teluguMovies.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              You've reached the end of our Telugu collection
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default TeluguCollectionPage;
