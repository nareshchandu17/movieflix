"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Play, Pause, PlayIcon, Info } from "lucide-react";
import { PageLoading } from "../loading/PageLoading";

const Hero = () => {
  const [slides, setSlides] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch hero slides data
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        // Try to fetch both movie and TV data with individual error handling
        const [movieResult, tvResult, trendingResult] = await Promise.allSettled([
          api.getPopular("movie", 1),
          api.getPopular("tv", 1),
          api.getTrending("all", "week"),
        ]);

        const movieData =
          movieResult.status === "fulfilled"
            ? movieResult.value.results.slice(0, 3)
            : [];
        const tvData =
          tvResult.status === "fulfilled"
            ? tvResult.value.results.slice(0, 2)
            : [];
        const trendingData =
          trendingResult.status === "fulfilled"
            ? trendingResult.value.results.slice(0, 1)
            : [];

        // Log any failures for debugging
        if (movieResult.status === "rejected") {
          console.warn(
            "Failed to fetch popular movies for hero:",
            movieResult.reason
          );
        }
        if (tvResult.status === "rejected") {
          console.warn(
            "Failed to fetch popular TV shows for hero:",
            tvResult.reason
          );
        }
        if (trendingResult.status === "rejected") {
          console.warn(
            "Failed to fetch trending content for hero:",
            trendingResult.reason
          );
        }

        // Combine available data to get exactly 6 slides
        const combined = [...movieData, ...tvData, ...trendingData];

        // If we have no data at all, return some fallback data or empty array
        if (combined.length === 0) {
          console.warn("No hero slides data available, using empty array");
          setSlides([]);
          return;
        }

        // If we have less than 6, fetch more from popular movies
        let finalSlides = combined.slice(0, 6);
        if (finalSlides.length < 6) {
          const additionalMovies = await api.getPopular("movie", Math.ceil((6 - finalSlides.length) / 20) + 1);
          const moreMovies = additionalMovies.results
            .filter(movie => !finalSlides.some(slide => slide.id === movie.id))
            .slice(0, 6 - finalSlides.length);
          finalSlides = [...finalSlides, ...moreMovies];
        }

        // Validate and normalize dates to timestamps
        const getValidTimestamp = (
          dateStr: string | null | undefined
        ): number => {
          if (!dateStr || dateStr.trim() === "") {
            return Number.NEGATIVE_INFINITY; // Sort invalid dates to end
          }
          const timestamp = Date.parse(dateStr);
          return isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
        };

        const sortedSlides = finalSlides.sort((a, b) => {
          // Extract candidate date strings
          const dateStringA =
            "release_date" in a ? a.release_date : a.first_air_date;
          const dateStringB =
            "release_date" in b ? b.release_date : b.first_air_date;

          const timestampA = getValidTimestamp(dateStringA);
          const timestampB = getValidTimestamp(dateStringB);

          return timestampB - timestampA; // Latest first
        });

        setSlides(sortedSlides.slice(0, 6)); // Ensure exactly 6 slides
      } catch (error) {
        console.error("Critical error in fetchHeroSlides:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  // Reset currentIndex if it becomes invalid when slides array changes
  useEffect(() => {
    if (slides && slides.length > 0) {
      setCurrentIndex((ci) => (ci >= slides.length ? 0 : ci));
    }
  }, [slides]);

  // Reset image error when slide changes
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  // Announce slide changes for screen readers
  useEffect(() => {
    if (slides && slides.length > 0) {
      const currentSlide = slides[currentIndex];
      const isTV = "name" in currentSlide;
      const title = isTV ? currentSlide.name : currentSlide.title;
      setAnnounceText(
        `Now showing: ${title}, slide ${currentIndex + 1} of ${slides.length}`
      );
    }
  }, [currentIndex, slides]);

  // Auto-slide functionality - change slides every 10 seconds when not paused
  useEffect(() => {
    if (!slides || slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [slides, isPaused]);

  // Early return after all hooks are called
  if (loading) {
    return <PageLoading>Wait a moment...</PageLoading>;
  }

  if (!slides || slides.length === 0) {
    return <div className="relative h-screen w-full bg-black" />;
  }

  const currentSlide = slides[currentIndex];
  const isTV = "name" in currentSlide;
  const title = isTV ? currentSlide.name : currentSlide.title;
  const href = isTV
    ? `/series/${currentSlide.id}`
    : `/movie/${currentSlide.id}`;

  // Construct full TMDB image URL with fallback
  const backdropUrl = currentSlide.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${currentSlide.backdrop_path}`
    : "https://i.imgur.com/wjVuAGb.png"; // Fallback image

  async function handlePlay(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    try {
      await router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  }

  async function handleMoreInfo(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();
    try {
      await router.push(href);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  }

  // Handle mouse interactions for accessibility
  const handleMouseEnter = () => {
    if (slides.length > 1) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (slides.length > 1) {
      setIsPaused(false);
    }
  };

  // Handle focus events for accessibility
  const handleFocus = () => {
    if (slides.length > 1) {
      setIsPaused(true);
    }
  };

  const handleBlur = () => {
    if (slides.length > 1) {
      setIsPaused(false);
    }
  };

  // Toggle pause state
  const togglePause = () => {
    if (slides.length > 1) {
      setIsPaused(!isPaused);
    }
  };

  // Swipe/Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (slides.length <= 1) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragCurrentX.current = clientX;
    lastTimestamp.current = Date.now();
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || slides.length <= 1) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTimestamp.current;
    
    dragCurrentX.current = clientX;
    const distance = clientX - dragStartX.current;
    
    // Calculate velocity (pixels per millisecond)
    if (timeDelta > 0) {
      dragVelocity.current = (clientX - dragCurrentX.current) / timeDelta;
    }
    
    setDragOffset(distance);
    lastTimestamp.current = currentTime;
  };

  const handleDragEnd = () => {
    if (!isDragging || slides.length <= 1) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);
    
    const distance = dragCurrentX.current - dragStartX.current;
    const threshold = 50; // Minimum drag distance to trigger slide change
    const velocityThreshold = 0.5; // Minimum velocity to trigger momentum slide
    
    let nextIndex = currentIndex;

    // Check velocity-based sliding (momentum)
    if (Math.abs(dragVelocity.current) > velocityThreshold) {
      // Swiped right (positive distance/velocity)
      if (dragVelocity.current > 0 || distance > threshold) {
        nextIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      }
      // Swiped left (negative distance/velocity)
      else if (dragVelocity.current < 0 || distance < -threshold) {
        nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
      }
    } else {
      // No momentum, use distance-based sliding
      if (distance > threshold) {
        // Swiped right
        nextIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
      } else if (distance < -threshold) {
        // Swiped left
        nextIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
      }
    }

    setCurrentIndex(nextIndex);
    setDragOffset(0);
    dragVelocity.current = 0;
    
    // Resume autoplay after a delay
    setTimeout(() => {
      setIsPaused(false);
    }, 500);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (slides.length <= 1) return;

    // Only handle keys when the hero container itself has focus, not child elements
    if (event.currentTarget !== event.target) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? slides.length - 1 : prevIndex - 1
        );
        break;
      case "ArrowRight":
        event.preventDefault();
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        togglePause();
        break;
    }
  };

  return (
    <div
      className="hero-carousel-focus relative w-full overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 cursor-grab active:cursor-grabbing"
      style={{ height: "100vh" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      tabIndex={0}
      role="region"
      aria-label="Hero carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ 
            opacity: 0, 
            x: isDragging ? 0 : 300,
            scale: isDragging ? 1 : 1.1
          }}
          animate={{ 
            opacity: 1, 
            x: isDragging ? dragOffset : 0,
            scale: isDragging ? 1 : 1
          }}
          exit={{ 
            opacity: 0, 
            x: -300,
            scale: 0.9
          }}
          transition={{ 
            duration: isDragging ? 0 : 0.8,
            type: "spring",
            stiffness: isDragging ? 300 : 80,
            damping: isDragging ? 30 : 15,
            mass: 1.2
          }}
          className="absolute inset-0"
        >
          <Image
            src={imageError ? "https://i.imgur.com/wjVuAGb.png" : backdropUrl}
            alt={`${title || "Featured content"} backdrop image`}
            fill
            className="object-cover"
            priority
            onError={() => {
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          className="max-w-3xl text-white"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4,
              type: "spring",
              stiffness: 90,
              damping: 18
            }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5,
              type: "spring",
              stiffness: 95,
              damping: 19
            }}
            className="flex flex-wrap items-center gap-3 mb-4 text-sm sm:text-base text-gray-300"
          >
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-medium">{currentSlide.vote_average?.toFixed(1) || 'N/A'} IMDb</span>
            </div>
            <span>•</span>
            <span>{isTV ? 'Crime, Drama' : 'Action, Thriller'}</span>
            <span>•</span>
            <span>{isTV ? '2018–Present' : currentSlide.release_date?.slice(0, 4) || '2024'}</span>
            <span>•</span>
            <span>{isTV ? '5 Seasons' : '2h 15m'}</span>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6,
              type: "spring",
              stiffness: 85,
              damping: 17
            }}
            className="mb-4"
          >
            <p className="text-lg sm:text-xl text-white font-medium italic">
              A late bloomer. A second chance. A rookie who refuses to quit.
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.7,
              type: "spring",
              stiffness: 88,
              damping: 18
            }}
            className="text-base sm:text-lg text-gray-300 mb-6 line-clamp-2 max-w-2xl"
          >
            Starting over isn't easy when you're the oldest rookie in the LAPD. Follow John Nolan as he navigates the challenges of police work while proving it's never too late to pursue your dreams.
          </motion.p>

          {/* Why Watch Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.8,
              type: "spring",
              stiffness: 92,
              damping: 19
            }}
            className="flex flex-wrap gap-4 mb-8 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <span className="text-gray-300">
                <span className="font-medium">Why watch:</span> Strong character growth + realistic cases
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🎯</span>
              <span className="text-gray-300">
                <span className="font-medium">Best for:</span> Crime drama lovers
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.9,
              type: "spring",
              stiffness: 95,
              damping: 20
            }}
            className="flex flex-wrap gap-3"
          >
            <Button
              size="default"
              className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              onClick={handlePlay}
              aria-label={`Play ${title}`}
            >
              <Play className="mr-2 h-5 w-5" />
              Play
            </Button>

            <Button
              variant="outline"
              size="default"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
              onClick={handleMoreInfo}
              aria-label={`More info about ${title}`}
            >
              <Info className="mr-2 h-5 w-5" />
              More Details
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Slide indicators and pause/play control */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
        {/* Slide dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-black cursor-pointer ${
                index === currentIndex
                  ? "bg-theme-primary"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>

        {/* Pause/Play control - only show if multiple slides */}
        {slides.length > 1 && (
          <button
            onClick={togglePause}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
            aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
            aria-pressed={isPaused}
          >
            {isPaused ? (
              <PlayIcon className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Pause indicator */}
      {isPaused && slides.length > 1 && (
        <div className="absolute top-8 right-8 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 z-20">
          <Pause className="h-3 w-3" />
          <span>Paused</span>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceText}
      </div>
    </div>
  );
};

export default Hero;
