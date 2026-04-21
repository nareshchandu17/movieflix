"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SeriesHero from "@/components/series/SeriesHero";
import SeriesCarousels from "@/components/series/SeriesCarousels";
import { motion } from "framer-motion";
import MediaCard from "@/components/display/MediaCard";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading, PageEmpty } from "@/components/loading/PageLoading";

interface SeriesFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

const SeriesPageClient = () => {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<SeriesFiltersData>({
    category: "",
    genre: "",
    year: "",
    sortBy: "popularity.desc",
  });
  
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(currentPage);
  const resultsRef = useRef<TMDBTVShow[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isGridView = !!(searchParams?.get("category") || searchParams?.get("genre"));

  // Initialize from URL params
  useEffect(() => {
    const page = parseInt(searchParams?.get("page") || "1");
    const category = searchParams?.get("category") || "";
    const genre = searchParams?.get("genre") || "";
    const year = searchParams?.get("year") || "";
    const sortBy = searchParams?.get("sort") || "popularity.desc";

    setCurrentPage(page);
    currentPageRef.current = page;
    setFilters({ category, genre, year, sortBy });
    
    // Reset infinite mode on new filter selection
    setIsInfiniteMode(false);
  }, [searchParams]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Fetch series when filters or page changes
  const fetchSeries = useCallback(async (isLoadMore = false, pageOverride?: number) => {
    const actualPage = pageOverride || (isLoadMore ? currentPageRef.current + 1 : 1);
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setSeries([]);
      resultsRef.current = [];
    }

    try {
      const seriesData = await api.getMedia("tv", {
        category: (filters.category || "popular") as any,
        page: actualPage,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        sortBy: filters.sortBy !== "popularity.desc" ? filters.sortBy : undefined,
      });

      const newResults = seriesData.results as TMDBTVShow[];
      
      if (isLoadMore) {
        setSeries(prev => {
          const combined = [...prev, ...newResults.filter(nr => !prev.some(p => p.id === nr.id))];
          resultsRef.current = combined;
          return combined;
        });
        setCurrentPage(actualPage);
      } else {
        setSeries(newResults);
        resultsRef.current = newResults;
        setCurrentPage(1);
      }

      setHasMore(actualPage < Math.min(seriesData.total_pages, 500));
      setTotalPages(Math.min(seriesData.total_pages, 500));
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error("[SeriesPage] Failed to fetch series:", error);
      if (!isLoadMore) setSeries([]);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      fetchSeries(true);
    }
  }, [hasMore, isLoadingMore, fetchSeries]);

  useEffect(() => {
    if (!isGridView) return; // Only fetch in grid mode
    fetchSeries();
  }, [fetchSeries, isGridView]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isGridView || !hasMore || isLoadingMore || !isInfiniteMode) {
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isGridView, hasMore, isLoadingMore, isInfiniteMode, loadMore]);

  const updateURL = (
    newFilters: Partial<SeriesFiltersData>,
    newPage?: number
  ) => {
    const params = new URLSearchParams();
    const page = newPage || currentPage;
    const updatedFilters = { ...filters, ...newFilters };

    if (page > 1) params.set("page", page.toString());
    if (updatedFilters.category !== "popular")
      params.set("category", updatedFilters.category);
    if (updatedFilters.genre) params.set("genre", updatedFilters.genre);
    if (updatedFilters.year) params.set("year", updatedFilters.year);
    if (updatedFilters.sortBy !== "popularity.desc")
      params.set("sort", updatedFilters.sortBy);

    const newURL = params.toString()
      ? `/series?${params.toString()}`
      : "/series";
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: SeriesFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsInfiniteMode(false);
    updateURL(newFilters, 1);
  };

  const getPageTitle = () => {
    if (filters.genre) {
      return "Category Results";
    }
    
    const categoryMap: { [key: string]: string } = {
      'trending': 'Trending TV Shows',
      'popular': 'Popular Series',
      'top_rated': 'Top Rated Series',
      'on_the_air': 'On The Air',
      'new-episodes': 'New Episodes This Week',
      'action': 'Action & Adventure',
      'comedy': 'Comedy Series',
      'drama': 'Drama Series',
      'sci-fi': 'Sci-Fi & Fantasy',
    };
    
    return categoryMap[filters.category] || "TV Series";
  };

  return (
    <div className="min-h-screen app-bg-enhanced pt-20">
      {!isGridView ? (
        <>
          {/* Home View */}
          <SeriesHero />
          <div className="relative z-10 -mt-32 pb-20">
            <div className="container mx-auto px-4 md:px-12 lg:px-20">
              <SeriesCarousels />
            </div>
          </div>
        </>
      ) : (
        /* Grid View (See All Mode) */
        <div className="container mx-auto px-4 md:px-12 lg:px-20 py-10">
          <div className="mb-10">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-2"
            >
              {getPageTitle()}
            </motion.h2>
            <div className="h-1 w-20 bg-red-600 rounded-full" />
          </div>

          {isLoading && series.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : series.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <p className="text-zinc-400 text-lg">No series found in this category.</p>
              <button 
                onClick={() => router.push('/series')}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {series.map((show) => (
                  <MediaCard 
                    key={show.id} 
                    media={show} 
                    variant="grid" 
                  />
                ))}
              </div>

              {/* Load More Area */}
              <div ref={loadMoreRef} className="w-full py-20 flex flex-col justify-center items-center">
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
                  </div>
                ) : !hasMore ? (
                  <p className="text-zinc-500 text-sm font-medium italic">
                    You've reached the end of the collection.
                  </p>
                ) : !isInfiniteMode ? (
                  <motion.button
                    onClick={() => {
                      loadMore();
                      setIsInfiniteMode(true);
                    }}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-xl shadow-red-600/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Load More Series
                  </motion.button>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SeriesPageClient;
