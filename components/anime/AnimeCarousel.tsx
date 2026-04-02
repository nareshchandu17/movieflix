"use client";

import { useEffect, useState, useRef } from "react";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AnimeCarousel = () => {
  const [anime, setAnime] = useState<((TMDBMovie & { media_type: 'movie' }) | (TMDBTVShow & { media_type: 'tv' }))[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardWidth, setCardWidth] = useState(200);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleAnimeClick = (item: (TMDBMovie & { media_type: 'movie' }) | (TMDBTVShow & { media_type: 'tv' })) => {
    const route = item.media_type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`;
    router.push(route);
  };

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        // Fetch anime movies and TV shows using animation genre ID (16)
        const [animeMoviesResponse, animeTVResponse] = await Promise.all([
          api.getMedia("movie", { category: "popular", genre: "16" }),
          api.getMedia("tv", { category: "popular", genre: "16" })
        ]);
        
        // Combine results and add media_type
        const animeMovies = animeMoviesResponse.results.map(movie => ({ ...movie, media_type: 'movie' as const }));
        const animeTVShows = animeTVResponse.results.map(show => ({ ...show, media_type: 'tv' as const }));
        
        // Combine and limit to 100 items
        const combinedAnime = [...animeMovies, ...animeTVShows].slice(0, 100);
        setAnime(combinedAnime);
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  // Update card width based on window size
  useEffect(() => {
    const updateCardWidth = () => {
      const width = window.innerWidth;
      if (width >= 768) {
        setCardWidth(200);
      } else if (width >= 640) {
        setCardWidth(180);
      } else {
        setCardWidth(160);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = cardWidth * 2 + 16; // Card width * 2 + gap

      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Anime</h2>
            <p className="text-gray-400">Loading anime content...</p>
          </div>
        </div>
        
        {/* Full-Bleed Scroll Container */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          <div className="relative group">
            <div
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 snap-start" style={{ width: `${cardWidth}px` }}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (anime.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Section Header */}
        

        {/* Full-Bleed Scroll Container */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          <div className="relative group">
            {/* Navigation Buttons */}

            <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Anime</h2>
            <p className="text-gray-400">Discover amazing anime series and movies</p>
          </div>
          <Link 
            href="/anime"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
            <button
              onClick={() => scroll("left")}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 z-20 border border-white/10 hover:border-red-500/50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll Container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4 px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {anime.map((item, index) => (
                <motion.div
                  key={`${item.media_type}-${item.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 snap-start cursor-pointer"
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => handleAnimeClick(item)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={'title' in item ? item.title : item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                    
                    {/* Individual hover overlay with 1-second delay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500 delay-150">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                          {'title' in item ? item.title : item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs">{item.vote_average.toFixed(1)}</span>
                          </div>
                          {('release_date' in item && item.release_date) || ('first_air_date' in item && item.first_air_date) ? (
                            <span className="text-white/70 text-xs">
                              {new Date(('release_date' in item ? item.release_date : item.first_air_date)!).getFullYear()}
                            </span>
                          ) : null}
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
              <div className="flex-shrink-0 w-12 md:w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCarousel;
