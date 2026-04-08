"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useCategoryData } from "@/lib/hooks";
import { ChevronRight, ChevronLeft, Play, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/ProfileContext";

interface CategorySectionProps {
  title: string;
  mediaType: "movie" | "tv";
  category:
    | "popular"
    | "top_rated"
    | "now_playing"
    | "upcoming"
    | "on_the_air"
    | "airing_today"
    | "trending";
  seeAllHref: string;
}

const CategorySection = ({
  title,
  mediaType,
  category,
  seeAllHref,
}: CategorySectionProps) => {
  const { activeProfile } = useProfile();
  const page = 1;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useCategoryData(mediaType, category, page, {
    isKids: activeProfile?.isKids,
    certificationLte: activeProfile?.maturityRating
  });
  const router = useRouter();

  const results: (TMDBMovie | TMDBTVShow)[] = data?.results || [];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (error) return null;

  if (isLoading && results.length === 0) {
    return (
      <div className="py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-1 h-8 bg-red-600 rounded-full" />
          <div className="w-48 h-8 bg-white/5 rounded" />
        </div>
        <div className="flex gap-4 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] md:w-[220px] aspect-[2/3] bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="relative group/section py-8 bg-black">
      {/* Header - Consistent Alignment */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-1">
              {category.replace('_', ' ')} {mediaType}s
            </p>
          </div>
        </div>
        <Link href={seeAllHref} className="flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 group/link bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
          <span className="text-xs font-black uppercase tracking-widest">See All</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>

      {/* Main Track - Full Bleed */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {results.slice(0, 15).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[160px] md:w-[200px] lg:w-[220px] aspect-[2/3] snap-start group/card relative"
            >
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/5 group-hover/card:border-white/20"
                onClick={() => router.push(`/${mediaType}/${item.id}`)}
              >
                <Image
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80'}
                  alt={(item as TMDBMovie).title || (item as TMDBTVShow).name || ""}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300 flex flex-col justify-end min-h-[50%]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="px-1.5 py-0.5 bg-red-600 rounded text-[8px] font-black text-white uppercase border border-red-500/20 shadow-lg shadow-red-600/20">
                      High Quality
                    </div>
                    {item.vote_average > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/5">
                        <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-white font-bold text-xs md:text-sm line-clamp-1 group-hover/card:text-red-500 transition-colors duration-300">
                    {(item as TMDBMovie).title || (item as TMDBTVShow).name}
                  </h3>
                  
                  {/* Action UI */}
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-1 group-hover/card:translate-y-0">
                    <button className="flex-1 bg-white hover:bg-red-600 text-black hover:text-white py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center justify-center gap-1 uppercase tracking-tighter">
                      <Play className="w-3 h-3 fill-current" />
                      Watch Now
                    </button>
                    <button className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default CategorySection;
