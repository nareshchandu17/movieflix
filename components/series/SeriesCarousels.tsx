"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/loading/PageLoading";
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Tv, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContinueWatchingSeries from "./ContinueWatchingSeries";
import TopPicksForYou from "./TopPicksForYou";
import NewEpisodesThisWeek from "./NewEpisodesThisWeek";
import BecauseYouWatchedSeries from "./BecauseYouWatchedSeries";
import RecentlyAddedSeries from "./RecentlyAddedSeries";
import PopularOnMovieFlix from "./PopularOnMovieFlix";
import BingeWorthySeries from "./BingeWorthySeries";

// Carousel Component
const SeriesCarousel = ({ 
  title, 
  series, 
  loading, 
  type = "default" 
}: { 
  title: string; 
  series: TMDBTVShow[]; 
  loading: boolean; 
  type?: string;
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleSeriesClick = (seriesId: number) => {
    router.push(`/series/${seriesId}`);
  };

  const handleSeeAll = () => {
    // Navigate to a filtered series page based on type
    const typeMap: { [key: string]: string } = {
      'trending': '/series?category=trending',
      'popular': '/series?category=popular',
      'topRated': '/series?category=top_rated',
      'action': '/series?genre=10759',
      'comedy': '/series?genre=35',
      'drama': '/series?genre=18',
      'sciFi': '/series?genre=10765',
      'mystery': '/series?genre=9648',
      'thriller': '/series?genre=53',
      'crime': '/series?genre=80',
      'documentary': '/series?genre=99',
      'reality': '/series?genre=10764',
      'romance': '/series?genre=10749',
      'family': '/series?genre=10751',
      'horror': '/series?genre=10768',
      'animation': '/series?genre=16',
      'kids': '/series?genre=10762',
      'war': '/series?genre=10768',
      'western': '/series?genre=37',
      'music': '/series?genre=10402',
      'talkShow': '/series?genre=10767',
      'news': '/series?genre=10763',
      'sports': '/series?genre=10770',
      'fitness': '/series?genre=10770'
    };
    
    const url = typeMap[type] || '/series';
    router.push(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1 transition-colors">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button 
          onClick={handleSeeAll}
          className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          See All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            width: 'calc(100vw + 2rem)' // Full bleed to right edge
          }}
        >
          {series.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 w-48 cursor-pointer"
              onClick={() => handleSeriesClick(item.id)}
            >
              <div className="relative h-72 rounded-lg overflow-hidden">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 12rem"
                />
                
                {/* Individual hover overlay with 1-second delay - removed group class */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 delay-150">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-white text-xs">{item.vote_average.toFixed(1)}</span>
                      </div>
                      {item.first_air_date && (
                        <span className="text-white/70 text-xs">
                          {new Date(item.first_air_date).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    {/* Buttons with 75% and 25% width */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-white text-black hover:bg-gray-200 flex-1 text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle play action
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/30 hover:bg-white/10 hover:text-white hover:border-white/30 w-8 h-8 p-0 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle add to watchlist
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        {series.length > 6 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Main Series Carousels Component
const SeriesCarousels = () => {
  const [carousels, setCarousels] = useState<{
    trending: TMDBTVShow[];
    popular: TMDBTVShow[];
    topRated: TMDBTVShow[];
    action: TMDBTVShow[];
    comedy: TMDBTVShow[];
    drama: TMDBTVShow[];
    sciFi: TMDBTVShow[];
    mystery: TMDBTVShow[];
    thriller: TMDBTVShow[];
    crime: TMDBTVShow[];
    documentary: TMDBTVShow[];
    reality: TMDBTVShow[];
    romance: TMDBTVShow[];
    family: TMDBTVShow[];
    horror: TMDBTVShow[];
    animation: TMDBTVShow[];
    kids: TMDBTVShow[];
    war: TMDBTVShow[];
    western: TMDBTVShow[];
    music: TMDBTVShow[];
    sports: TMDBTVShow[];
    fitness: TMDBTVShow[];
  }>({
    trending: [],
    popular: [],
    topRated: [],
    action: [],
    comedy: [],
    drama: [],
    sciFi: [],
    mystery: [],
    thriller: [],
    crime: [],
    documentary: [],
    reality: [],
    romance: [],
    family: [],
    horror: [],
    animation: [],
    kids: [],
    war: [],
    western: [],
    music: [],
    sports: [],
    fitness: []
  });
  const [loading, setLoading] = useState<{
    trending: boolean;
    popular: boolean;
    topRated: boolean;
    action: boolean;
    comedy: boolean;
    drama: boolean;
    sciFi: boolean;
    mystery: boolean;
    thriller: boolean;
    crime: boolean;
    documentary: boolean;
    reality: boolean;
    romance: boolean;
    family: boolean;
    horror: boolean;
    animation: boolean;
    kids: boolean;
    war: boolean;
    western: boolean;
    music: boolean;
    sports: boolean;
    fitness: boolean;
  }>({
    trending: false,
    popular: false,
    topRated: false,
    action: false,
    comedy: false,
    drama: false,
    sciFi: false,
    mystery: false,
    thriller: false,
    crime: false,
    documentary: false,
    reality: false,
    romance: false,
    family: false,
    horror: false,
    animation: false,
    kids: false,
    war: false,
    western: false,
    music: false,
    sports: false,
    fitness: false
  });

  // Initialize loading states
  useEffect(() => {
    const initialLoading: {
      trending: boolean;
      popular: boolean;
      topRated: boolean;
      action: boolean;
      comedy: boolean;
      drama: boolean;
      sciFi: boolean;
      mystery: boolean;
      thriller: boolean;
      crime: boolean;
      documentary: boolean;
      reality: boolean;
      romance: boolean;
      family: boolean;
      horror: boolean;
      animation: boolean;
      kids: boolean;
      war: boolean;
      western: boolean;
      music: boolean;
      sports: boolean;
      fitness: boolean;
    } = {
      trending: true,
      popular: true,
      topRated: true,
      action: true,
      comedy: true,
      drama: true,
      sciFi: true,
      mystery: true,
      thriller: true,
      crime: true,
      documentary: true,
      reality: true,
      romance: true,
      family: true,
      horror: true,
      animation: true,
      kids: true,
      war: true,
      western: true,
      music: true,
      sports: true,
      fitness: true
    };
    setLoading(initialLoading);
  }, []);

  // Fetch data for each carousel
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        // Trending Series
        setLoading(prev => ({ ...prev, trending: true }));
        const trending = await api.getTrending("tv", "week");
        setCarousels(prev => ({ ...prev, trending: trending.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, trending: false }));

        // Popular Series
        setLoading(prev => ({ ...prev, popular: true }));
        const popular = await api.getPopular("tv", 1);
        setCarousels(prev => ({ ...prev, popular: popular.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, popular: false }));

        // Top Rated Series
        setLoading(prev => ({ ...prev, topRated: true }));
        const topRated = await api.getTopRated("tv", 1);
        setCarousels(prev => ({ ...prev, topRated: topRated.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, topRated: false }));

        // Action Series
        setLoading(prev => ({ ...prev, action: true }));
        const action = await api.getMedia("tv", { genre: "10759", page: 1 });
        setCarousels(prev => ({ ...prev, action: action.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, action: false }));

        // Comedy Series
        setLoading(prev => ({ ...prev, comedy: true }));
        const comedy = await api.getMedia("tv", { genre: "35", page: 1 });
        setCarousels(prev => ({ ...prev, comedy: comedy.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, comedy: false }));

        // Drama Series
        setLoading(prev => ({ ...prev, drama: true }));
        const drama = await api.getMedia("tv", { genre: "18", page: 1 });
        setCarousels(prev => ({ ...prev, drama: drama.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, drama: false }));

        // Sci-Fi Series
        setLoading(prev => ({ ...prev, sciFi: true }));
        const sciFi = await api.getMedia("tv", { genre: "10765", page: 1 });
        setCarousels(prev => ({ ...prev, sciFi: sciFi.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, sciFi: false }));

        // Mystery Series
        setLoading(prev => ({ ...prev, mystery: true }));
        const mystery = await api.getMedia("tv", { genre: "9648", page: 1 });
        setCarousels(prev => ({ ...prev, mystery: mystery.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, mystery: false }));

        // Thriller Series - Try multiple approaches
        setLoading(prev => ({ ...prev, thriller: true }));
        try {
          const thriller = await api.getMedia("tv", { genre: "53", page: 1 });
          if (thriller.results.length === 0) {
            // Fallback to mystery if no thriller content
            const fallbackThriller = await api.getMedia("tv", { genre: "9648", page: 1 });
            setCarousels(prev => ({ ...prev, thriller: fallbackThriller.results.slice(0, 10) as TMDBTVShow[] }));
          } else {
            setCarousels(prev => ({ ...prev, thriller: thriller.results.slice(0, 10) as TMDBTVShow[] }));
          }
        } catch (error) {
          console.warn("Thriller genre failed, using popular as fallback:", error);
          const fallbackThriller = await api.getPopular("tv", 1);
          setCarousels(prev => ({ ...prev, thriller: fallbackThriller.results.slice(0, 10) as TMDBTVShow[] }));
        }
        setLoading(prev => ({ ...prev, thriller: false }));

        // Crime Series
        setLoading(prev => ({ ...prev, crime: true }));
        const crime = await api.getMedia("tv", { genre: "80", page: 1 });
        setCarousels(prev => ({ ...prev, crime: crime.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, crime: false }));

        // Documentary Series
        setLoading(prev => ({ ...prev, documentary: true }));
        const documentary = await api.getMedia("tv", { genre: "99", page: 1 });
        setCarousels(prev => ({ ...prev, documentary: documentary.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, documentary: false }));

        // Reality Series
        setLoading(prev => ({ ...prev, reality: true }));
        const reality = await api.getMedia("tv", { genre: "10764", page: 1 });
        setCarousels(prev => ({ ...prev, reality: reality.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, reality: false }));

        // Romance Series
        setLoading(prev => ({ ...prev, romance: true }));
        const romance = await api.getMedia("tv", { genre: "10749", page: 1 });
        setCarousels(prev => ({ ...prev, romance: romance.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, romance: false }));

        // Family Series
        setLoading(prev => ({ ...prev, family: true }));
        const family = await api.getMedia("tv", { genre: "10751", page: 1 });
        setCarousels(prev => ({ ...prev, family: family.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, family: false }));

        // Horror Series
        setLoading(prev => ({ ...prev, horror: true }));
        const horror = await api.getMedia("tv", { genre: "10768", page: 1 });
        setCarousels(prev => ({ ...prev, horror: horror.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, horror: false }));

        // Animation Series
        setLoading(prev => ({ ...prev, animation: true }));
        const animation = await api.getMedia("tv", { genre: "16", page: 1 });
        setCarousels(prev => ({ ...prev, animation: animation.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, animation: false }));

        // Kids Series
        setLoading(prev => ({ ...prev, kids: true }));
        const kids = await api.getMedia("tv", { genre: "10762", page: 1 });
        setCarousels(prev => ({ ...prev, kids: kids.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, kids: false }));

        // War & Politics Series
        setLoading(prev => ({ ...prev, war: true }));
        const war = await api.getMedia("tv", { genre: "10768", page: 1 });
        setCarousels(prev => ({ ...prev, war: war.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, war: false }));

        // Western Series
        setLoading(prev => ({ ...prev, western: true }));
        const western = await api.getMedia("tv", { genre: "37", page: 1 });
        setCarousels(prev => ({ ...prev, western: western.results.slice(0, 10) as TMDBTVShow[] }));
        setLoading(prev => ({ ...prev, western: false }));

        // Music Series - Try multiple approaches
        setLoading(prev => ({ ...prev, music: true }));
        try {
          const music = await api.getMedia("tv", { genre: "10402", page: 1 });
          if (music.results.length === 0) {
            // Fallback to reality if no music content
            const fallbackMusic = await api.getMedia("tv", { genre: "10764", page: 1 });
            setCarousels(prev => ({ ...prev, music: fallbackMusic.results.slice(0, 10) as TMDBTVShow[] }));
          } else {
            setCarousels(prev => ({ ...prev, music: music.results.slice(0, 10) as TMDBTVShow[] }));
          }
        } catch (error) {
          console.warn("Music genre failed, using popular as fallback:", error);
          const fallbackMusic = await api.getPopular("tv", 2);
          setCarousels(prev => ({ ...prev, music: fallbackMusic.results.slice(0, 10) as TMDBTVShow[] }));
        }
        setLoading(prev => ({ ...prev, music: false }));

        // Sports Series - Try multiple approaches
        setLoading(prev => ({ ...prev, sports: true }));
        try {
          const sports = await api.getMedia("tv", { genre: "10770", page: 1 });
          if (sports.results.length === 0) {
            // Fallback to documentary if no sports content
            const fallbackSports = await api.getMedia("tv", { genre: "99", page: 1 });
            setCarousels(prev => ({ ...prev, sports: fallbackSports.results.slice(0, 10) as TMDBTVShow[] }));
          } else {
            setCarousels(prev => ({ ...prev, sports: sports.results.slice(0, 10) as TMDBTVShow[] }));
          }
        } catch (error) {
          console.warn("Sports genre failed, using popular as fallback:", error);
          const fallbackSports = await api.getPopular("tv", 3);
          setCarousels(prev => ({ ...prev, sports: fallbackSports.results.slice(0, 10) as TMDBTVShow[] }));
        }
        setLoading(prev => ({ ...prev, sports: false }));

        // Fitness Series - Use a different approach, maybe combine with lifestyle
        setLoading(prev => ({ ...prev, fitness: true }));
        try {
          const fitness = await api.getMedia("tv", { genre: "10770", page: 1 });
          setCarousels(prev => ({ ...prev, fitness: fitness.results.slice(0, 10) as TMDBTVShow[] }));
        } catch (error) {
          console.warn("Fitness genre failed, trying with documentary:", error);
          const fallbackFitness = await api.getMedia("tv", { genre: "99", page: 1 });
          setCarousels(prev => ({ ...prev, fitness: fallbackFitness.results.slice(0, 10) as TMDBTVShow[] }));
        }
        setLoading(prev => ({ ...prev, fitness: false }));

      } catch (error) {
        console.error("Error fetching carousel data:", error);
      }
    };

    fetchCarouselData();
  }, []);

  return (
    <div className="space-y-12">
      {/* New Carousels - Below Hero Section */}
      <ContinueWatchingSeries />
      <TopPicksForYou userName="User" />
      <SeriesCarousel
        title="Trending Now"
        series={carousels.trending || []}
        loading={loading.trending || false}
        type="trending"
      />
      <SeriesCarousel
        title="Top 10 in India Today"
        series={carousels.popular || []}
        loading={loading.popular || false}
        type="popular"
      />
      <NewEpisodesThisWeek />
      <BecauseYouWatchedSeries watchedShowName="Breaking Bad" />
      <RecentlyAddedSeries />
      <PopularOnMovieFlix />
      <BingeWorthySeries />

      {/* Existing Genre Carousels */}
      <SeriesCarousel
        title="Popular Series"
        series={carousels.popular || []}
        loading={loading.popular || false}
        type="popular"
      />

      {/* Top Rated */}
      <SeriesCarousel
        title="Top Rated Series"
        series={carousels.topRated || []}
        loading={loading.topRated || false}
        type="topRated"
      />

      {/* Action & Adventure */}
      <SeriesCarousel
        title="Action & Adventure"
        series={carousels.action || []}
        loading={loading.action || false}
        type="action"
      />

      {/* Comedy */}
      <SeriesCarousel
        title="Comedy Series"
        series={carousels.comedy || []}
        loading={loading.comedy || false}
        type="comedy"
      />

      {/* Drama */}
      <SeriesCarousel
        title="Drama Series"
        series={carousels.drama || []}
        loading={loading.drama || false}
        type="drama"
      />

      {/* Sci-Fi & Fantasy */}
      <SeriesCarousel
        title="Sci-Fi & Fantasy"
        series={carousels.sciFi || []}
        loading={loading.sciFi || false}
        type="sciFi"
      />

      {/* Mystery & Suspense */}
      <SeriesCarousel
        title="Mystery & Suspense"
        series={carousels.mystery || []}
        loading={loading.mystery || false}
        type="mystery"
      />

      {/* Thriller */}
      <SeriesCarousel
        title="Thriller Series"
        series={carousels.thriller || []}
        loading={loading.thriller || false}
        type="thriller"
      />

      {/* Crime Series */}
      <SeriesCarousel
        title="Crime Series"
        series={carousels.crime || []}
        loading={loading.crime || false}
        type="crime"
      />

      {/* Documentary */}
      <SeriesCarousel
        title="Documentary Series"
        series={carousels.documentary || []}
        loading={loading.documentary || false}
        type="documentary"
      />

      {/* Reality TV */}
      <SeriesCarousel
        title="Reality TV"
        series={carousels.reality || []}
        loading={loading.reality || false}
        type="reality"
      />

      {/* Romance Series */}
      <SeriesCarousel
        title="Romance & Love Stories"
        series={carousels.romance || []}
        loading={loading.romance || false}
        type="romance"
      />

      {/* Family Series */}
      <SeriesCarousel
        title="Family & Kids"
        series={carousels.family || []}
        loading={loading.family || false}
        type="family"
      />

      {/* Horror Series */}
      <SeriesCarousel
        title="Horror & Supernatural"
        series={carousels.horror || []}
        loading={loading.horror || false}
        type="horror"
      />

      {/* Animation Series */}
      <SeriesCarousel
        title="Animation & Cartoons"
        series={carousels.animation || []}
        loading={loading.animation || false}
        type="animation"
      />

      {/* Kids Series */}
      <SeriesCarousel
        title="Kids & Educational"
        series={carousels.kids || []}
        loading={loading.kids || false}
        type="kids"
      />

      {/* War & Politics Series */}
      <SeriesCarousel
        title="War & Politics"
        series={carousels.war || []}
        loading={loading.war || false}
        type="war"
      />

      {/* Western Series */}
      <SeriesCarousel
        title="Western & Historical"
        series={carousels.western || []}
        loading={loading.western || false}
        type="western"
      />

      {/* Music Series */}
      <SeriesCarousel
        title="Music & Musical"
        series={carousels.music || []}
        loading={loading.music || false}
        type="music"
      />

      
      {/* Sports Series */}
      <SeriesCarousel
        title="Sports & Fitness"
        series={carousels.sports || []}
        loading={loading.sports || false}
        type="sports"
      />

      
    </div>
  );
};

export default SeriesCarousels;
