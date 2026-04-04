"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Play, Pause, PlayIcon, Tv, Calendar, Star, TrendingUp, Clock, Info } from "lucide-react";
import { PageLoading } from "../loading/PageLoading";

const SeriesHero = () => {
  const [slides, setSlides] = useState<TMDBTVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [announceText, setAnnounceText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const router = useRouter();

  // Swipe tracking refs
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);
  const dragVelocity = useRef(0);
  const lastTimestamp = useRef(0);

  // Auto-play interval ref
  const autoplayInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch series hero slides data with intelligent selection
  useEffect(() => {
    const fetchSeriesHeroSlides = async () => {
      try {
        setLoading(true);
        console.log("[SeriesHero] Fetching series for hero carousel with intelligent selection");
        
        // Fetch multiple categories for diverse selection
        const [
          popularResult,
          topRatedResult,
          trendingResult
        ] = await Promise.allSettled([
          api.getPopular("tv", 1),
          api.getTopRated("tv", 1),
          api.getTrending("tv", "week")
        ]);

        // Collect available series from different categories
        const allSeries: TMDBTVShow[] = [];
        
        // Add from popular (3 slots - High-Intensity)
        if (popularResult.status === "fulfilled") {
          allSeries.push(...popularResult.value.results.slice(0, 4) as TMDBTVShow[]);
        }
        
        // Add from top-rated (2 slots - Prestige)
        if (topRatedResult.status === "fulfilled") {
          allSeries.push(...topRatedResult.value.results.slice(0, 3) as TMDBTVShow[]);
        }
        
        // Add from trending (2 slots - Trend/Hook)
        if (trendingResult.status === "fulfilled") {
          allSeries.push(...trendingResult.value.results.slice(0, 3) as TMDBTVShow[]);
        }

        if (allSeries.length === 0) {
          console.warn("[SeriesHero] No series data available from any source");
          setSlides([]);
          return;
        }

        // Intelligent selection based on coverage buckets
        const selectedSlides = selectDiverseSeries(allSeries);
        setSlides(selectedSlides);
        console.log(`[SeriesHero] Successfully selected ${selectedSlides.length} diverse series for hero`);
        
      } catch (error) {
        console.error("[SeriesHero] Failed to fetch series for hero:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesHeroSlides();
  }, []);

  // Intelligent series selection based on coverage buckets
  const selectDiverseSeries = (allSeries: TMDBTVShow[]): TMDBTVShow[] => {
    const selected: TMDBTVShow[] = [];
    const used = new Set<number>();
    
    // Helper to categorize series based on genre IDs and characteristics
    const categorizeSeries = (series: TMDBTVShow): string => {
      const genreIds = series.genre_ids || [];
      
      // High-Intensity / Visual Anchor (Sci-Fi / Thriller / Action)
      if (genreIds.includes(10765) || genreIds.includes(10759) || genreIds.includes(28)) {
        return "high_intensity";
      }
      
      // Prestige / Award Feel (Historical drama / epic storytelling)
      if (genreIds.includes(18) || genreIds.includes(36)) {
        return "prestige";
      }
      
      // Stylized / Aesthetic (Neo-noir / cyberpunk / crime)
      if (genreIds.includes(80) || genreIds.includes(9648)) {
        return "stylized";
      }
      
      // Emotional Anchor (Romance / relationship drama)
      if (genreIds.includes(10749) || genreIds.includes(18)) {
        return "emotional";
      }
      
      // Bright / Relief Content (Comedy / light drama)
      if (genreIds.includes(35)) {
        return "bright";
      }
      
      // Trend / Hook Content (Tech / conspiracy / new season)
      if (genreIds.includes(10765) || genreIds.includes(10768)) {
        return "trending";
      }
      
      // Default categorization based on popularity and rating
      if (series.popularity > 1000) return "trending";
      if (series.vote_average > 8) return "prestige";
      return "emotional";
    };

    // Get series by category
    const getSeriesByCategory = (category: string, exclude: Set<number> = new Set()): TMDBTVShow | null => {
      return allSeries.find(s => !exclude.has(s.id) && categorizeSeries(s) === category) || null;
    };

    // Selection strategy: 6-7 High-Intensity, Prestige, Emotional, Bright, Trending series
    
    // 1. High-Intensity / Visual Anchor (2 slots)
    const highIntensity1 = getSeriesByCategory("high_intensity", used);
    if (highIntensity1) {
      selected.push(highIntensity1);
      used.add(highIntensity1.id);
    }
    
    const highIntensity2 = getSeriesByCategory("high_intensity", used);
    if (highIntensity2) {
      selected.push(highIntensity2);
      used.add(highIntensity2.id);
    }
    
    // 2. Prestige / Award Feel (1 slot)
    const prestige = getSeriesByCategory("prestige", used);
    if (prestige) {
      selected.push(prestige);
      used.add(prestige.id);
    }
    
    // 3. Emotional Anchor (1 slot)
    const emotional = getSeriesByCategory("emotional", used);
    if (emotional) {
      selected.push(emotional);
      used.add(emotional.id);
    }
    
    // 4. Bright / Relief Content (1 slot)
    const bright = getSeriesByCategory("bright", used);
    if (bright) {
      selected.push(bright);
      used.add(bright.id);
    }
    
    // 5. Trend / Hook Content (1 slot)
    const trending = getSeriesByCategory("trending", used);
    if (trending) {
      selected.push(trending);
      used.add(trending.id);
    }
    
    // 6. Additional High-Intensity (1 more slot for variety)
    const highIntensity3 = getSeriesByCategory("high_intensity", used);
    if (highIntensity3) {
      selected.push(highIntensity3);
      used.add(highIntensity3.id);
    }
    
    // If we don't have 6-7 diverse series, fill with remaining popular ones
    if (selected.length < 7) {
      const remaining = allSeries
        .filter(s => !used.has(s.id))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 7 - selected.length);
      
      selected.push(...remaining);
    }
    
    // Sort by visual variety (alternating dark/light themes)
    return selected.slice(0, 7);
  };

  // Auto-play functionality
  const startAutoplay = () => {
    if (!isPaused && slides.length > 1) {
      autoplayInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 5000); // Change slide every 5 seconds
    }
  };

  const stopAutoplay = () => {
    if (autoplayInterval.current) {
      clearInterval(autoplayInterval.current);
      autoplayInterval.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [isPaused, slides.length]);

  // Handle slide navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAnnounceText(`Slide ${index + 1} of ${slides.length}`);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Touch handlers
  const handleTouchStart = (e: any) => {
    setIsDragging(true);
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    dragCurrentX.current = e.touches ? e.touches[0].clientX : e.clientX;
    dragVelocity.current = 0;
    lastTimestamp.current = Date.now();
    stopAutoplay();
  };

  const handleTouchMove = (e: any) => {
    if (!isDragging) return;
    
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - dragStartX.current;
    setDragOffset(deltaX);
    
    // Calculate velocity
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimestamp.current;
    if (deltaTime > 0) {
      dragVelocity.current = (currentX - dragCurrentX.current) / deltaTime;
    }
    
    dragCurrentX.current = currentX;
    lastTimestamp.current = currentTime;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    
    setDragOffset(0);
    
    // Restart autoplay after a delay
    setTimeout(() => {
      if (!isPaused) {
        startAutoplay();
      }
    }, 3000);
  };

  // Handle image click
  const handleSlideClick = (slide: TMDBTVShow) => {
    router.push(`/series/${slide.id}`);
  };

  // Handle play button
  const handlePlayClick = (e: React.MouseEvent, slide: TMDBTVShow) => {
    e.stopPropagation();
    router.push(`/series/${slide.id}`);
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen min-h-[600px] bg-gradient-to-br from-slate-900 to-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <PageLoading>Loading series...</PageLoading>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen min-h-[600px] bg-gradient-to-br from-slate-900 to-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No series available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      {/* CSS for hero zoom animation */}
      <style jsx>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>
      
      <div className="relative w-full h-screen min-h-[600px] bg-gradient-to-br from-slate-900 to-black overflow-hidden">
        {/* Top Gradient Overlay - Header blend effect */}
        <div 
          className="absolute top-0 left-0 w-full h-[120px] z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4), rgba(0,0,0,0))'
          }}
        />
        
        {/* Left Side Cinematic Shadow for readability */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1), rgba(0,0,0,0))'
          }}
        />
        
        {/* Slides container */}
        <div className="relative h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={handleTouchStart}
              onDrag={handleTouchMove}
              onDragEnd={handleTouchEnd}
              style={{ 
                x: dragOffset,
                animation: 'heroZoom 20s ease-in-out infinite alternate'
              }}
            >
              {/* Background image */}
              <div className="relative w-full h-full">
                {currentSlide.backdrop_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`}
                    alt={currentSlide.name || "Series backdrop"}
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                    sizes="100vw"
                    style={{
                      animation: 'heroZoom 20s ease-in-out infinite alternate'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                
                {/* Removed additional gradient overlay for cleaner look */}
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 z-40 flex items-start justify-start">
                <div className="w-full px-8 py-12">
                  <div className="w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="space-y-4 text-left"
                      style={{
                        paddingLeft: '60px',
                        maxWidth: '600px',
                        position: 'absolute',
                        bottom: '48px'
                      }}
                    >
                    {/* Series info */}
                    <div className="space-y-2">
                      {/* Series title */}
                      <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                        {currentSlide.name || "Untitled Series"}
                      </h1>
                      
                      {/* Series metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-white">
                        {currentSlide.first_air_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-white" />
                            <span className="text-sm text-white font-medium">
                              {new Date(currentSlide.first_air_date).getFullYear()}
                            </span>
                          </div>
                        )}
                        
                        {currentSlide.vote_average > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-semibold text-white">
                              {currentSlide.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                        
                        {currentSlide.genre_ids && currentSlide.genre_ids.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tv className="w-4 h-4 text-white" />
                            <span className="text-sm text-white font-medium">TV Series</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Series overview */}
                    {currentSlide.overview && (
                      <p className="text-lg text-white max-w-3xl line-clamp-3 leading-relaxed drop-shadow-md">
                        {currentSlide.overview}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Button
                        onClick={(e) => handlePlayClick(e, currentSlide)}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Watch Now
                      </Button>
                      
                      <Button
                        onClick={() => router.push(`/series/${currentSlide.id}`)}
                        size="lg"
                        className="p-3 bg-white hover:bg-gray-200 border-0 transition-all duration-300"
                        aria-label="More info"
                      >
                        <Info className="w-5 h-5 text-black" />
                        <span className="text-black font-semibold ml-2">More Info</span>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      {slides.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 z-30 hover:scale-110"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 z-30 hover:scale-110"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>

          {/* Play/Pause button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute bottom-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 z-30 hover:scale-110"
            aria-label={isPaused ? "Play autoplay" : "Pause autoplay"}
          >
            {isPaused ? (
              <Play className="w-3 h-3" />
            ) : (
              <Pause className="w-3 h-3" />
            )}
          </button>
        </>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announceText}
      </div>
    </div>
    </>
  );
};

export default SeriesHero;
