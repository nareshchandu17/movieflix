"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Play, Plus, ChevronLeft, ChevronRight, Volume2, VolumeX, Info } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player/lazy';
import { api } from '@/lib/api';
import { TMDBMovie } from '@/lib/types';

// --- Sub-components (Local) ---

/**
 * Magnetic Button for premium interaction feedback
 */
const MagneticButton = ({ children, className, onClick, whileHover, whileTap }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.35);
    y.set((clientY - centerY) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.1, ...whileHover }}
      whileTap={{ scale: 0.95, ...whileTap }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// --- Main Component ---

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  backdrop: string;
  video?: string;
  genre: string[];
  rating: string;
  duration: string;
  year: string;
}

const HeroSection = () => {
  const router = useRouter();
  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Optimized video state management with intersection observer
  useEffect(() => {
    setShowVideo(false);
    setIsVideoReady(false);
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    
    // Faster video start for better UX
    videoTimerRef.current = setTimeout(() => {
      setShowVideo(true);
    }, 800); // Reduced from 1500ms for instant feel
  }, [currentSlide]);

  // Intersection Observer for performance optimization
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isCurrentlyIntersecting = entry.isIntersecting && entry.intersectionRatio > 0.5;
        
        setIsIntersecting(isCurrentlyIntersecting);
        setIsInView(isCurrentlyIntersecting);
        
        // ReactPlayer handles play/pause automatically via the playing prop
        // No need to manually call play/pause methods
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    observer.observe(containerRef.current);
    intersectionObserverRef.current = observer;

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [isVideoReady]);

  const [progress, setProgress] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const videoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPlayerRef = useRef<any>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Memoized current slide data
  const currentSlideData = useMemo(() => {
    if (heroSlides.length === 0) return null;
    return heroSlides[currentSlide];
  }, [heroSlides, currentSlide]);

  // Next/Prev Slide logic with guards (Fixes NaN crash)
  const nextSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setProgress(0);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    if (heroSlides.length === 0) return;
    setProgress(0);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setProgress(0);
    setCurrentSlide(index);
  }, []);

  // Fetch logic
  useEffect(() => {
    const fetchHeroMovies = async () => {
      try {
        setLoading(true);
        const response = await api.discover('movie', { sortBy: 'popularity.desc', page: 1 });
        const movies = (response.results as TMDBMovie[]) || [];
        const topMovies = movies.slice(0, 5);

        // Add specific movies including Durandhar The Revenge
        const specificMovies = [
          {
            id: 9999999, // Durandhar The Revenge (placeholder ID - prevents TMDB API calls)
            title: "Durandhar The Revenge",
            overview: "An action-packed Hindi revenge thriller that delivers high-octane entertainment and gripping drama.",
            backdrop_path: "/durandhar_backdrop.jpg", // Placeholder path
            genre_ids: [28, 53, 18], // Action, Thriller, Drama
            adult: false,
            release_date: "2025-03-19"
          },
          {
            id: 8888888, // Another popular recent release (placeholder)
            title: "The Last Warrior",
            overview: "An epic adventure featuring breathtaking visuals and compelling storytelling.",
            backdrop_path: "/warrior_backdrop.jpg", // Placeholder path
            genre_ids: [28, 12, 14], // Action, Adventure, Fantasy
            adult: false,
            release_date: "2025-02-15"
          }
        ];

        // Combine popular movies with specific movies, ensuring no duplicates and total of 7
        const allMovies = [...topMovies, ...specificMovies].slice(0, 7);

        const slides: HeroSlide[] = await Promise.all(allMovies.map(async (movie) => {
          let videoKey: string | undefined;
          // Skip video fetching for placeholder movies (IDs >= 8888888)
          if (movie.id < 8888888) {
            try {
              const videoData = await api.getVideos('movie', movie.id);
              const trailer = videoData.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videoData.results?.[0];
              videoKey = trailer?.key;
            } catch (e) {
              console.error(`Failed to fetch video for ${movie.id}:`, e);
            }
          }

          return {
            id: movie.id,
            title: movie.title,
            description: movie.overview.length > 160 ? movie.overview.substring(0, 160) + '...' : movie.overview,
            backdrop: movie.backdrop_path && !movie.backdrop_path.includes('.jpg') ? 
              `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 
              (movie.backdrop_path && movie.backdrop_path.includes('durandhar')) ? 
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop' : // Action movie placeholder
                (movie.backdrop_path && movie.backdrop_path.includes('warrior')) ? 
                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop' : // Adventure movie placeholder
                  'https://images.unsplash.com/photo-1489599807961-c7960cb221c6?w=1920&h=1080&fit=crop',
            video: videoKey ? `https://www.youtube.com/watch?v=${videoKey}` : undefined,
            genre: movie.genre_ids.slice(0, 3).map(id => {
              const genreMap: { [key: number]: string } = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' };
              return genreMap[id] || 'Action';
            }),
            rating: movie.adult ? '18+' : '16+',
            duration: movie.title.includes('Durandhar') ? '3h 40m' : '2h 15m', // Correct runtime for Durandhar
            year: movie.release_date?.split('-')[0] || '2025'
          };
        }));
        setHeroSlides(slides);
      } catch (error) {
        console.error('❌ Failed to fetch hero movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroMovies();
  }, []);

  // Performance: Preload Next Slide Background & Video
  useEffect(() => {
    if (heroSlides.length > 0) {
      const nextIdx = (currentSlide + 1) % heroSlides.length;
      
      // Preload next slide image
      const nextImg = new window.Image();
      nextImg.src = heroSlides[nextIdx].backdrop;
      
      // Preload next slide video if available
      if (heroSlides[nextIdx].video) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = heroSlides[nextIdx].video;
        document.head.appendChild(link);
      }
    }
  }, [currentSlide, heroSlides]);

  // Optimized autoplay logic with intersection awareness
  useEffect(() => {
    if (isPlaying && !isHovered && heroSlides.length > 0 && isIntersecting) {
      const intervalDuration = 50; 
      const totalDuration = 6000; 
      const step = (intervalDuration / totalDuration) * 100;

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + step;
        });
      }, intervalDuration);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isHovered, heroSlides.length, nextSlide, isIntersecting]);

  // Handlers
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
    videoTimerRef.current = setTimeout(() => setShowVideo(true), 800); // Faster response
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
    if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
  };

  // Optimized video ready handler
  const handleVideoReady = (player: any) => {
    videoPlayerRef.current = player;
    setIsVideoReady(true);
    
    // Force higher quality if possible (YouTube specific)
    const internalPlayer = player.getInternalPlayer();
    if (internalPlayer && internalPlayer.setPlaybackQuality) {
      internalPlayer.setPlaybackQuality('hd1080');
    }
    
    // Auto-play if in view - ReactPlayer handles play/pause via playing prop
    if (isIntersecting) {
      // ReactPlayer will automatically play when playing prop is true
      setIsVideoReady(true);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoTimerRef.current) clearTimeout(videoTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (intersectionObserverRef.current) intersectionObserverRef.current.disconnect();
      // ReactPlayer cleanup is handled automatically
      videoPlayerRef.current = null;
    };
  }, []);

  if (loading || !currentSlideData) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="hero-full-bleed relative w-full h-screen overflow-hidden bg-black select-none m-0 p-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background & Cinematic Engine */}
      <AnimatePresence mode="wait">
        {/* VIDEO LAYER (optimized performance) */}
        {currentSlideData.video && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (showVideo && isIntersecting) ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <ReactPlayer
                url={currentSlideData.video}
                width="100%"
                height="100%"
                playing={showVideo && isIntersecting}
                muted={isMuted}
                loop
                controls={false}
                playsinline
                progressInterval={100}
                onReady={handleVideoReady}
                onPlay={() => setIsVideoReady(true)}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      mute: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      iv_load_policy: 3,
                      cc_load_policy: 0,
                      fs: 0,
                      disablekb: 1,
                      playsinline: 1
                    },
                    embedOptions: {
                      host: "https://www.youtube.com"
                    }
                  }
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none"
                }}
              />
            </div>
          </motion.div>
        )}
        {/* IMAGE LAYER (poster preview with instant load) */}
        <motion.div
          key={`image-${currentSlide}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: showVideo ? 0 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={currentSlideData.backdrop}
              alt={currentSlideData.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              style={{
                objectPosition: "center",
                objectFit: "cover"
              }}
            />
          </div>
          {/* Multi-layer Gradient: Netflix/Hotstar Style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-y-0 left-0 w-[50vw] bg-gradient-to-r from-black/40 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic UI: Improved Visibility & Premium Polish */}
      <motion.div 
        animate={{ opacity: showVideo && isHovered ? 0.9 : 1 }} // Keep visible but slightly dim for trailer
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <div className="absolute inset-0 flex flex-col justify-end pb-32 px-6 md:px-16">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl pointer-events-auto"
          >
            {/* Meta Info: Premium Staggered Style */}
            <div className="flex items-center gap-3 mb-6">
              <div className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-red-800 text-[10px] font-black uppercase tracking-widest text-white rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/30">
                Trending #1
              </div>
              <span className="text-white font-bold text-sm drop-shadow-xl">{currentSlideData.year}</span>
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              <div className="px-1.5 py-0.5 border border-white/20 rounded-sm text-[10px] text-white font-bold backdrop-blur-sm">
                {currentSlideData.rating}
              </div>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span className="text-white/80 font-semibold text-sm drop-shadow-md">{currentSlideData.duration}</span>
            </div>

            {/* Cinematic Title: Netflix Style Shine */}
            <h1
              className="text-3xl md:text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter"
              style={{
                textShadow: '0 0 30px rgba(0,0,0,0.8), 0 10px 60px rgba(0,0,0,0.5)',
                WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                letterSpacing: '-0.02em'
              }}
            >
              {currentSlideData.title}
            </h1>

            {/* Genre chips: Improved Glassmorphism */}
            <div className="flex flex-wrap gap-2 mb-8">
              {currentSlideData.genre.map((g) => (
                <span key={g} className="px-4 py-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full text-white font-bold text-[11px] md:text-xs tracking-wider hover:bg-white/20 transition-all cursor-default shadow-lg">
                  {g}
                </span>
              ))}
            </div>

            {/* Description: Better Readability */}
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,1)] line-clamp-3 md:line-clamp-none">
              {currentSlideData.description}
            </p>

            {/* Magnetic CTA Buttons: Hotstar Style */}
            <div className="flex items-center gap-4">
              <MagneticButton
                onClick={() => router.push(`/movie/${currentSlideData.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black rounded-xl transition-all shadow-lg group"
              >
                <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <span className="text-lg uppercase tracking-wider drop-shadow-md">Play Now</span>
              </MagneticButton>

              <MagneticButton
                onClick={() => router.push(`/movie/${currentSlideData.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 text-white font-black rounded-xl hover:bg-white/20 transition-all group"
              >
                <Info className="w-5 h-5 group-hover:text-white transition-colors" />
                <span className="text-lg uppercase tracking-wider drop-shadow-md">More Info</span>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Mute Toggle: High Visibility */}
        {showVideo && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.15 }}
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="absolute bottom-12 right-12 w-16 h-16 bg-black/60 backdrop-blur-3xl border border-white/20 rounded-full flex flex-col items-center justify-center text-white z-40 pointer-events-auto shadow-2xl hover:border-red-500 transition-all"
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-white/60" /> : <Volume2 className="w-6 h-6 text-red-500 animate-pulse" />}
            <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-40">{isMuted ? 'Muted' : 'Audio'}</span>
          </motion.button>
        )}
      </motion.div>

      {/* Nav Arrows */}
      <div className="absolute inset-y-0 left-0 w-32 z-30 hidden md:flex items-center justify-start pl-8 group/nav">
        <button
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-center text-white opacity-0 group-hover/nav:opacity-100 transition-all duration-500 hover:bg-red-600 hover:border-red-600 -translate-x-4 group-hover/nav:translate-x-0 cursor-pointer shadow-2xl pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-32 z-30 hidden md:flex items-center justify-end pr-8 group/nav">
        <button
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-center text-white opacity-0 group-hover/nav:opacity-100 transition-all duration-500 hover:bg-red-600 hover:border-red-600 translate-x-4 group-hover/nav:translate-x-0 cursor-pointer shadow-2xl pointer-events-auto"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Interaction Indicators (Glass style) */}
      <div className="absolute bottom-10 left-10 md:left-16 flex gap-3 z-30 items-center">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group py-4 px-1 flex items-center justify-center pointer-events-auto"
          >
            <div className={`rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 h-2 bg-red-600 outline outline-4 outline-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'w-2 h-2 bg-white/40 group-hover:bg-white/60'}`} />
          </button>
        ))}
      </div>

      {/* Bottom Vignette */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default HeroSection;
