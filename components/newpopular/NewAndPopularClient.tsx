"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSpotlight from "./HeroSpotlight";
import FilterBar from "./FilterBar";
import Top10Row from "./Top10Row";
import NewReleasesGrid from "./NewReleasesGrid";
import TrendingCarousel from "./TrendingCarousel";
import NewForYouGrid from "./NewForYouGrid";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/loading/PageLoading";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Play, 
  ChevronRight, 
  Sparkles,
  Flame,
  Crown,
  Zap
} from "lucide-react";

interface Filters {
  format: string;
  genre: string;
  sort: string;
  smartMode: boolean;
}

const NewAndPopularClient = () => {
  const [allMedia, setAllMedia] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [trendingMedia, setTrendingMedia] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [newReleases, setNewReleases] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [top10Media, setTop10Media] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [personalizedMedia, setPersonalizedMedia] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    format: "all",
    genre: "",
    sort: "trending",
    smartMode: false
  });
  const [activeSection, setActiveSection] = useState<string>("trending");

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('newAndPopularFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('newAndPopularFilters', JSON.stringify(filters));
  }, [filters]);

  // Enhanced sorting with AI mode
  const sortMedia = useCallback((media: (TMDBMovie | TMDBTVShow)[]) => {
    let sorted = [...media];
    
    if (filters.smartMode) {
      // AI-based sorting (simulate with enhanced algorithm)
      sorted = sorted.sort((a, b) => {
        const scoreA = calculateAIScore(a);
        const scoreB = calculateAIScore(b);
        return scoreB - scoreA;
      });
    } else {
      // Traditional sorting
      switch (filters.sort) {
        case "newest":
          sorted = sorted.sort((a, b) => {
            const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
            const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
            return new Date(dateB || '').getTime() - new Date(dateA || '').getTime();
          });
          break;
        case "rating":
          sorted = sorted.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case "for-you":
          sorted = sorted.sort(() => Math.random() - 0.5);
          break;
        default: // trending
          sorted = sorted.sort((a, b) => b.popularity - a.popularity);
      }
    }
    
    return sorted;
  }, [filters]);

  // AI score calculation
  const calculateAIScore = (media: TMDBMovie | TMDBTVShow) => {
    const ratingScore = media.vote_average * 10;
    const popularityScore = Math.min(media.popularity / 50, 20);
    const recencyScore = getRecencyScore(media);
    const matchScore = calculateMatchPercentage(media) / 2;
    return ratingScore + popularityScore + recencyScore + matchScore;
  };

  const getRecencyScore = (media: TMDBMovie | TMDBTVShow) => {
    const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
    if (!releaseDate) return 0;
    const daysSinceRelease = Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceRelease / 30); // Higher score for newer content
  };

  const calculateMatchPercentage = (media: TMDBMovie | TMDBTVShow) => {
    const baseScore = media.vote_average * 10;
    const popularityBoost = Math.min(media.popularity / 100, 20);
    const randomFactor = Math.random() * 10;
    return Math.min(Math.floor(baseScore + popularityBoost + randomFactor), 99);
  };

  const fetchMediaData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[NewAndPopular] Fetching unique media data for all carousels...");

      // Fetch diverse data sets for different carousels
      const [
        trendingMovies,
        popularMovies,
        topRatedMovies,
        upcomingMovies,
        nowPlayingMovies,
        trendingTV,
        popularTV,
        topRatedTV,
        onAirTV,
        airingTodayTV
      ] = await Promise.allSettled([
        api.getTrending("movie", "week"),
        api.getPopular("movie", 1),
        api.getTopRated("movie", 1),
        api.getMedia("movie", { category: "upcoming" }),
        api.getMedia("movie", { category: "now_playing" }),
        api.getTrending("tv", "week"),
        api.getPopular("tv", 1),
        api.getTopRated("tv", 1),
        api.getMedia("tv", { category: "on_the_air" }),
        api.getMedia("tv", { category: "airing_today" })
      ]);

      // Extract data with fallbacks
      const trendingMoviesData = trendingMovies.status === "fulfilled" ? trendingMovies.value.results : [];
      const popularMoviesData = popularMovies.status === "fulfilled" ? popularMovies.value.results : [];
      const topRatedMoviesData = topRatedMovies.status === "fulfilled" ? topRatedMovies.value.results : [];
      const upcomingMoviesData = upcomingMovies.status === "fulfilled" ? upcomingMovies.value.results : [];
      const nowPlayingMoviesData = nowPlayingMovies.status === "fulfilled" ? nowPlayingMovies.value.results : [];
      
      const trendingTVData = trendingTV.status === "fulfilled" ? trendingTV.value.results : [];
      const popularTVData = popularTV.status === "fulfilled" ? popularTV.value.results : [];
      const topRatedTVData = topRatedTV.status === "fulfilled" ? topRatedTV.value.results : [];
      const onAirTVData = onAirTV.status === "fulfilled" ? onAirTV.value.results : [];
      const airingTodayTVData = airingTodayTV.status === "fulfilled" ? airingTodayTV.value.results : [];

      // Create unique datasets for different carousel types
      const allMovies = [...trendingMoviesData, ...popularMoviesData, ...topRatedMoviesData, ...upcomingMoviesData, ...nowPlayingMoviesData];
      const allTV = [...trendingTVData, ...popularTVData, ...topRatedTVData, ...onAirTVData, ...airingTodayTVData];
      
      // Remove duplicates within each category
      const uniqueMovies = allMovies.filter((media, index, self) => 
        index === self.findIndex((m) => m.id === media.id)
      );
      const uniqueTV = allTV.filter((media, index, self) => 
        index === self.findIndex((m) => m.id === media.id)
      );
      
      const allCombinedMedia = [...uniqueMovies, ...uniqueTV];
      const uniqueCombinedMedia = allCombinedMedia.filter((media, index, self) => 
        index === self.findIndex((m) => m.id === media.id)
      );

      // Sort and prepare different datasets for carousels
      const sortedByPopularity = [...uniqueCombinedMedia].sort((a, b) => b.popularity - a.popularity);
      const sortedByRating = [...uniqueCombinedMedia].sort((a, b) => b.vote_average - a.vote_average);
      const sortedByDate = [...uniqueCombinedMedia].sort((a, b) => {
        const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
        const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
        return new Date(dateB || '').getTime() - new Date(dateA || '').getTime();
      });

      // Set base datasets
      setAllMedia(sortedByPopularity.slice(0, 100));
      setTrendingMedia(trendingMoviesData.slice(0, 20));
      setNewReleases(sortedByDate.slice(0, 30));
      setTop10Media(sortedByRating.slice(0, 10));
      setPersonalizedMedia(sortedByPopularity.slice(0, 40));

      console.log(`[NewAndPopular] Loaded ${uniqueCombinedMedia.length} unique items across all categories`);
    } catch (error) {
      console.error("[NewAndPopular] Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMediaData();
  }, [fetchMediaData]);

  // Specialized data fetching for each carousel type
  const getNewThisWeek = useCallback(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return allMedia.filter(item => {
      const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
      return releaseDate && new Date(releaseDate) > sevenDaysAgo;
    }).slice(0, 15);
  }, [allMedia]);

  const getRecentlyAdded = useCallback(() => {
    // Use different data source for recently added
    return [...trendingMedia, ...newReleases].slice(0, 15);
  }, [trendingMedia, newReleases]);

  const getNewSeasons = useCallback(() => {
    // Focus on TV shows with recent activity
    return allMedia.filter(item => 'first_air_date' in item).slice(0, 15);
  }, [allMedia]);

  const getBecauseYouWatched = useCallback((genreId: number) => {
    return allMedia.filter(item => item.genre_ids?.includes(genreId)).slice(0, 15);
  }, [allMedia]);

  const getHiddenGems = useCallback(() => {
    return allMedia.filter(item => item.popularity < 500 && item.vote_average > 7.5).slice(0, 15);
  }, [allMedia]);

  const getGenreSpecific = useCallback((genreIds: number[]) => {
    return allMedia.filter(item => genreIds.some(id => item.genre_ids?.includes(id))).slice(0, 15);
  }, [allMedia]);

  const getMostDiscussed = useCallback(() => {
    return allMedia.filter(item => item.popularity > 1000).slice(0, 15);
  }, [allMedia]);

  const getAwardWinners = useCallback(() => {
    return allMedia.filter(item => item.vote_average > 8.0 && item.vote_count > 1000).slice(0, 15);
  }, [allMedia]);

  const getGloballyTrending = useCallback(() => {
    return allMedia.filter(item => item.popularity > 2000).slice(0, 15);
  }, [allMedia]);

  const getBingeWorthy = useCallback(() => {
    return allMedia.filter(item => 'first_air_date' in item && item.vote_average > 8.0).slice(0, 15);
  }, [allMedia]);

  const getShortContent = useCallback(() => {
    return allMedia.filter(item => 'runtime' in item && item.runtime && (item as any).runtime < 120).slice(0, 15);
  }, [allMedia]);

  const getFamilyContent = useCallback(() => {
    return allMedia.filter(item => !item.adult && item.vote_average > 7.0).slice(0, 15);
  }, [allMedia]);

  const getFilteredMedia = useCallback((media: (TMDBMovie | TMDBTVShow)[]) => {
    let filtered = media.filter(item => {
      if (filters.format !== "all") {
        if (filters.format === "movie" && 'first_air_date' in item) return false;
        if (filters.format === "tv" && 'release_date' in item) return false;
      }
      return true;
    });

    if (filters.smartMode) {
      // AI-powered sorting
      filtered = filtered
        .map(item => ({
          ...item,
          aiScore: calculateAIScore(item)
        }))
        .sort((a, b) => (b as any).aiScore - (a as any).aiScore);
    } else {
      // Random shuffle for variety
      filtered = filtered.sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [filters.smartMode, filters.format, calculateAIScore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-red-500 border-t-transparent border-r-transparent border-b-transparent rounded-full"
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl text-gray-300"
            >
              Loading premium content...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'hero', title: 'Featured', icon: Sparkles },
    { id: 'top10', title: 'Top 10', icon: Crown },
    { id: 'new', title: 'New Releases', icon: Clock },
    { id: 'trending', title: 'Trending Now', icon: Flame },
    { id: 'foryou', title: 'For You', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        

        {/* Hero Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          <HeroSpotlight media={getFilteredMedia(allMedia).slice(0, 5)} />
          
          {/* Enhanced Filter Bar - Overlay on Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-0 left-0 right-0 z-30"
          >
            <FilterBar />
          </motion.div>
        </motion.div>

        {/* Content Sections - Enhanced Carousels */}
        <div className="space-y-12">
          {/* 🎬 Continue Watching */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Continue Watching</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20">RESUME</span>
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 border border-indigo-400/20">WATCHLIST</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.slice(0, 5))} />
          </motion.div>

          {/* ⚡ Quick Picks for You */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Quick Picks for You</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border border-cyan-400/20">PERSONAL</span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20">AI PICKS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(personalizedMedia)} />
          </motion.div>

          {/* Top 10 in Your Country */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Top 10 in Your Country</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 border border-red-400/20">DAILY</span>
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-105 border border-yellow-400/20">RANKED</span>
              </div>
            </div>
            <Top10Row media={getFilteredMedia(top10Media)} />
          </motion.div>

          {/* Trending Right Now */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Trending Right Now</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 border border-orange-400/20">REAL-TIME</span>
                <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 border border-red-400/20">VIRAL</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(trendingMedia)} />
          </motion.div>

          {/* Globally Trending */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Globally Trending</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20">WORLDWIDE</span>
                <span className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border border-cyan-400/20">BREAKOUT</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.popularity > 500).slice(0, 10))} />
          </motion.div>

          {/* Most Discussed This Week */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Most Discussed This Week</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 border border-red-400/20">SOCIAL</span>
                <span className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 border border-rose-400/20">BUZZ</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.popularity > 300).slice(0, 10))} />
          </motion.div>

          {/* New This Week */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">New This Week</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20">FRESH</span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 border border-purple-400/20">7 DAYS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(getNewThisWeek())} />
          </motion.div>

          {/* New Seasons Just Dropped */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">New Seasons Just Dropped</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 border border-purple-400/20">NEW SEASON</span>
                <span className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 border border-pink-400/20">SERIES</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => 'first_air_date' in item).slice(0, 10))} />
          </motion.div>

          {/* Recently Added */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Recently Added</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 border border-green-400/20">NEW</span>
                <span className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 border border-emerald-400/20">LICENSED</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(newReleases)} />
          </motion.div>

          {/* New For You */}
          {/* 🎯 New For You */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">New For You</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 border border-cyan-400/20">PERSONAL</span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 border border-blue-400/20">AI PICKS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(personalizedMedia)} />
          </motion.div>

          {/* 🎬 Because You Watched {Action} */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Because You Watched Action</h2>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 border border-indigo-400/20">SIMILAR</span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 border border-purple-400/20">CONTEXTUAL</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(28)).slice(0, 10))} />
          </motion.div>

          {/* 🎭 If You Liked {Last Watched Title} */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 3.0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">If You Liked Last Watched Title</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-600 rounded-full text-white text-sm font-semibold">RECOMMENDED</span>
                <span className="px-3 py-1 bg-pink-600 rounded-full text-white text-sm font-semibold">SIMILAR</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.vote_average > 7.5).slice(0, 10))} />
          </motion.div>
          {/* 🌟 Trending Among Viewers Like You */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 3.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-green-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Trending Among Viewers Like You</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-600 rounded-full text-white text-sm font-semibold">COMMUNITY</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-white text-sm font-semibold">PEERS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.popularity > 500 && item.vote_average > 7.0).slice(0, 10))} />
          </motion.div>

          {/* � Hidden Gems For You */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 3.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-green-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Hidden Gems For You</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-600 rounded-full text-white text-sm font-semibold">UNDISCOVERED</span>
                <span className="px-3 py-1 bg-green-600 rounded-full text-white text-sm font-semibold">RARE</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.popularity < 500 && item.vote_average > 7.5).slice(0, 10))} />
          </motion.div>

          {/* 🌙 Tonight's Picks */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 3.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Tonight's Picks</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-600 rounded-full text-white text-sm font-semibold">EVENING</span>
                <span className="px-3 py-1 bg-orange-600 rounded-full text-white text-sm font-semibold">TIME-BASED</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.slice(0, 10))} />
          </motion.div>

          {/* 🏆 Critics' Picks */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 3.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Critics' Picks</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-white text-sm font-semibold">TOP RATED</span>
                <span className="px-3 py-1 bg-amber-600 rounded-full text-white text-sm font-semibold">AWARDS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.vote_average > 8.5).slice(0, 10))} />
          </motion.div>
          {/* 🎖️ Award Winners & Nominees */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Award Winners & Nominees</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-600 rounded-full text-white text-sm font-semibold">OSCAR</span>
                <span className="px-3 py-1 bg-yellow-600 rounded-full text-white text-sm font-semibold">EMMY</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.vote_average > 8.0 && item.vote_count > 1000).slice(0, 10))} />
          </motion.div>

          {/* 🚀 Sci-Fi Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Sci-Fi Spotlight</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-600 rounded-full text-white text-sm font-semibold">ROTATING</span>
                <span className="px-3 py-1 bg-pink-600 rounded-full text-white text-sm font-semibold">GENRE</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(878)).slice(0, 10))} />
          </motion.div>

          {/* ⚔️ Action & Adventure */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Action & Adventure</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600 rounded-full text-white text-sm font-semibold">THRILL</span>
                <span className="px-3 py-1 bg-orange-600 rounded-full text-white text-sm font-semibold">ADVENTURE</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(28) || item.genre_ids?.includes(12)).slice(0, 10))} />
          </motion.div>

          {/* 🔍 Thrillers & Crime */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-500 to-slate-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Thrillers & Crime</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-600 rounded-full text-white text-sm font-semibold">SUSPENSE</span>
                <span className="px-3 py-1 bg-slate-600 rounded-full text-white text-sm font-semibold">CRIME</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(53) || item.genre_ids?.includes(80)).slice(0, 10))} />
          </motion.div>

          {/* 😄 Comedy Hits */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Comedy Hits</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-pink-600 rounded-full text-white text-sm font-semibold">FUNNY</span>
                <span className="px-3 py-1 bg-rose-600 rounded-full text-white text-sm font-semibold">LAUGHS</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(35)).slice(0, 10))} />
          </motion.div>

          {/* 💕 Romance & Drama */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 5.0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Romance & Drama</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm font-semibold">LOVE</span>
                <span className="px-3 py-1 bg-pink-600 rounded-full text-white text-sm font-semibold">DRAMA</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(10749) || item.genre_ids?.includes(18)).slice(0, 10))} />
          </motion.div>

          {/* 🌌 Sci-Fi & Fantasy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 5.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Sci-Fi & Fantasy</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-white text-sm font-semibold">FUTURE</span>
                <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm font-semibold">MAGIC</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(878) || item.genre_ids?.includes(14)).slice(0, 10))} />
          </motion.div>

          {/* 📚 Documentaries & True Stories */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 5.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Documentaries & True Stories</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-600 rounded-full text-white text-sm font-semibold">REAL</span>
                <span className="px-3 py-1 bg-teal-600 rounded-full text-white text-sm font-semibold">TRUE</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.filter(item => item.genre_ids?.includes(99)).slice(0, 10))} />
          </motion.div>


          {/* ⏱️ Short & Sweet (Under 2 Hours) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 5.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-teal-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Short & Sweet (Under 2 Hours)</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-cyan-600 rounded-full text-white text-sm font-semibold">QUICK</span>
                <span className="px-3 py-1 bg-teal-600 rounded-full text-white text-sm font-semibold">BINGE</span>
              </div>
            </div>
            <NewReleasesGrid media={getFilteredMedia(allMedia.slice(0, 15))} />
          </motion.div>

        </div>

        {/* Premium Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-20 py-12 border-t border-gray-800"
        >
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold">CINEWORLD</h3>
            </div>
            <p className="text-gray-400 mb-4">Your premium entertainment destination</p>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <span>© 2024 CINEWORLD</span>
              <span>•</span>
              <span>Elite Streaming Experience</span>
            </div>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default NewAndPopularClient;
