"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface CollectionMediaItem {
  _id: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string;
  voteAverage?: number;
  addedAt: string;
}

interface CollectionCarouselProps {
  title: string;
  items: CollectionMediaItem[];
}

export default function CollectionCarousel({ title, items }: CollectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!items) return null;

  if (items.length === 0) {
    return (
      <div className="relative group/section py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase border-l-4 border-blue-500 pl-3">
              {title}
            </h2>
          </div>
        </div>
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          <div 
            onClick={() => router.push('/')}
            className="w-full h-[200px] md:h-[300px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group/empty"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover/empty:scale-110 transition-transform group-hover/empty:bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0)] group-hover/empty:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Plus className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover/empty:text-blue-400 transition-colors">No items yet</h3>
            <p className="text-gray-400 font-medium text-sm">Click here to add some movies now</p>
          </div>
        </div>
      </div>
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/section py-8">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase border-l-4 border-blue-500 pl-3">
            {title}
          </h2>
        </div>
      </div>

      {/* Full-Bleed Scroll Track */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 sm:px-6 md:px-12 lg:px-20"
          style={{ scrollPaddingLeft: '5rem' }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[160px] md:w-[200px] aspect-[2/3] snap-start group/card relative"
            >
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-white/5 group-hover/card:border-blue-500/30"
                onClick={() => router.push(`/${item.mediaType === "series" ? "series" : "movie"}/${item.tmdbId}`)}
              >
                <Image
                  src={item.posterPath ? (item.posterPath.startsWith('http') ? item.posterPath : `https://image.tmdb.org/t/p/w500${item.posterPath}`) : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80'}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 160px, 200px"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[9px] font-black text-white uppercase">
                      {item.mediaType}
                    </span>
                    {(item.voteAverage && item.voteAverage > 0) ? (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10">
                        <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-bold text-white">{item.voteAverage.toFixed(1)}</span>
                      </div>
                    ) : null}
                  </div>
                  
                  <h3 className="text-white font-bold text-sm line-clamp-2 group-hover/card:text-blue-400 transition-colors shadow-black drop-shadow-md">
                    {item.title}
                  </h3>
                  
                  {/* Action UI */}
                  <div className="flex items-center gap-3 mt-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/watch/${item.tmdbId}`);
                      }}
                      className="flex-1 bg-white hover:bg-blue-500 text-black hover:text-white py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
}
