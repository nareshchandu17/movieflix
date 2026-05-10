"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Star,
  Pause,
  PlayCircle,
  Volume2,
  VolumeX
} from "lucide-react";

// Curated list as requested
const curatedTitles = [
  { id: 693134, type: 'movie', title: 'Dune: Part Two' },
  { id: 533535, type: 'movie', title: 'Deadpool & Wolverine' },
  { id: 1291608, type: 'movie', title: 'Dhurandhar' },
  { id: 76479, type: 'tv', title: 'The Boys' },
  { id: 94997, type: 'tv', title: 'House of the Dragon' },
  { id: 65930, type: 'tv', title: 'My Hero Academia' }
];

export default function Hero() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHeroSlides = useCallback(async () => {
    console.log("[Hero] Starting fetch for curated slides...");
    try {
      const results = await Promise.all(
        curatedTitles.map(async (item) => {
          try {
            console.log(`[Hero] Fetching details for ${item.title} (${item.id})...`);
            const data = await (item.type === 'movie'
              ? api.getDetails('movie', item.id)
              : api.getDetails('tv', item.id));
            return data;
          } catch (err) {
            console.error(`[Hero] Error fetching ${item.title}:`, err);
            return null;
          }
        })
      );

      const validSlides = results.filter((s) => s !== null);
      console.log(`[Hero] Successfully loaded ${validSlides.length} slides.`);

      if (validSlides.length === 0) {
        console.warn("[Hero] No curated slides loaded, falling back to popular...");
        const popular = await api.getPopular('movie', 1);
        setSlides(popular.results.slice(0, 6));
      } else {
        setSlides(validSlides);
      }
    } catch (error) {
      console.error("[Hero] Fatal error in fetchHeroSlides:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroSlides();
  }, [fetchHeroSlides]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(nextSlide, 8000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, slides.length, isPaused]);

  if (loading) {
    return (
      <div className="relative h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
          <p className="text-white/50 font-bold tracking-widest animate-pulse">PREPARING CINEMATIC EXPERIENCE</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const isTV = 'name' in currentSlide;
  const title = isTV ? (currentSlide as TMDBTVShow).name : (currentSlide as TMDBMovie).title;
  const date = isTV ? (currentSlide as TMDBTVShow).first_air_date : (currentSlide as TMDBMovie).release_date;
  const year = date ? new Date(date).getFullYear() : 'N/A';
  const rating = currentSlide.vote_average?.toFixed(1) || 'N/A';

  const backdropUrl = currentSlide.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${currentSlide.poster_path}`;

  // OTT-grade Cinematic Variants
  const cinematicVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.4 }
      }
    })
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] group">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={cinematicVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {/* Hero Background Layer */}
          <div className="absolute inset-0 z-0">
            <Image
              src={backdropUrl}
              alt={title}
              fill
              priority
              className="object-cover object-top brightness-[0.6] transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-110"
              sizes="100vw"
            />
            {/* Top Vignette Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent h-1/2" />
          </div>

          {/* Main Content Layer */}
          <div className="relative z-10 h-full container mx-auto px-6 md:px-12 lg:px-24 flex flex-col justify-end pb-24 lg:pb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl space-y-6"
            >
              {/* Meta Info Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-sm uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                  Premium Spotlight
                </motion.div>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  <span className="text-base font-black text-white">{rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-gray-300 text-base font-bold tracking-tight">{year}</span>
              </div>

              {/* Cinematic Title */}
              <div className="space-y-1">
                <motion.h1
                  layoutId="title"
                  className="text-4xl md:text-6xl lg:text-7xl font-[900] text-white tracking-tighter leading-[0.9] uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] italic"
                >
                  {title}
                </motion.h1>
              </div>

              {/* Engaging Description */}
              <p className="text-gray-200 text-lg md:text-xl line-clamp-2 font-medium max-w-2xl leading-snug drop-shadow-lg text-balance opacity-80">
                {currentSlide.overview}
              </p>

              {/* Dynamic Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0-20px rgba(220,38,38,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/watch/${currentSlide.id}?type=${isTV ? 'series' : 'movie'}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-black text-sm transition-all shadow-2xl relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                  <Play className="w-5 h-5 fill-current" />
                  WATCH NOW
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${isTV ? 'tv' : 'movie'}/${currentSlide.id}`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-2xl text-white border border-white/20 rounded-lg font-black text-sm transition-all"
                >
                  <Info className="w-5 h-5" />
                  DETAILS
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Persistent Navigation Elements */}
      <div className="absolute bottom-12 right-12 z-30 flex flex-col items-end gap-8">
        {/* Indicators */}
        <div className="flex flex-col gap-4 items-end">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className="group/dot relative flex items-center gap-4"
            >
              <span className={`text-[10px] font-black tracking-widest transition-all duration-300 ${i === currentIndex ? 'text-red-500 opacity-100' : 'text-white opacity-0 group-hover/dot:opacity-40'
                }`}>
                0{i + 1}
              </span>
              <div className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex
                  ? 'w-16 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                  : 'w-4 bg-white/20 group-hover/dot:bg-white/40 group-hover/dot:w-8'
                }`} />
            </button>
          ))}
        </div>


      </div>



    </section>
  );
}
