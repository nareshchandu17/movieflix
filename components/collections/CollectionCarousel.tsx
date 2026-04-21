"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus, Star, Trash2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface CollectionMediaItem {
  _id: string;
  tmdbId: number;
  collectionId: string; // Added to help with deletion
  mediaType: string;
  title: string;
  overview?: string; // Added for description
  posterPath: string;
  voteAverage?: number;
  addedAt: string;
}

interface CollectionCarouselProps {
  title: string;
  items: CollectionMediaItem[];
}

export default function CollectionCarousel({ title, items: initialItems }: CollectionCarouselProps) {
  const [items, setItems] = useState<CollectionMediaItem[]>(initialItems);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CollectionMediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleRemove = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsDeleting(true);
      const res = await fetch("/api/collections/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: itemToDelete.collectionId,
          tmdbId: itemToDelete.tmdbId
        }),
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item._id !== itemToDelete._id));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!items) return null;

  if (items.length === 0) {
    return (
      <div className="relative group/section py-8">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase border-l-4 border-red-500 pl-3">
              {title}
            </h2>
          </div>
        </div>
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          <div 
            onClick={() => router.push('/')}
            className="w-full h-[200px] md:h-[300px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all cursor-pointer group/empty"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 group-hover/empty:scale-110 transition-transform group-hover/empty:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0)] group-hover/empty:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Plus className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover/empty:text-red-400 transition-colors">No items yet</h3>
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
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase border-l-4 border-red-500 pl-3">
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
                className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group-hover/card:scale-105 group-hover/card:shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-white/5 group-hover/card:border-red-500/30"
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
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="px-1.5 py-0.5 bg-red-600 rounded text-[9px] font-black text-white uppercase">
                        {item.mediaType}
                      </span>
                      {(item.voteAverage && item.voteAverage > 0) ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10">
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-[9px] font-bold text-white">{item.voteAverage.toFixed(1)}</span>
                        </div>
                      ) : null}
                    </div>
                    
                    <h3 className="text-white font-black text-sm line-clamp-1 group-hover/card:text-red-400 transition-colors shadow-black drop-shadow-md">
                      {item.title}
                    </h3>

                    {/* Description added - line-clamp-2 for better space management */}
                    <p className="text-gray-400 text-[10px] leading-tight line-clamp-2 mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-100">
                      {item.overview || "No description available."}
                    </p>
                    
                    {/* Action UI - Standardized Split Buttons (75% / 25%) */}
                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/watch/${item.tmdbId}`);
                        }}
                        className="w-[75%] bg-white hover:bg-red-500 text-black hover:text-white py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Play
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                          setShowDeleteModal(true);
                        }}
                        className="w-[25%] bg-white/10 hover:bg-red-600/20 text-white hover:text-red-500 py-2 rounded-lg text-xs font-black transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>

      {/* RIGHT BUTTON */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-black/60 backdrop-blur-md z-40 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Wait a moment!</h3>
                <p className="text-gray-400">
                  Are you sure want to delete/remove <span className="text-white font-semibold">"{itemToDelete?.title}"</span> from your watchlist?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleRemove}
                    className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Removing...
                      </>
                    ) : 'Yes, Remove It'}
                  </button>
                </div>
              </div>
              
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
