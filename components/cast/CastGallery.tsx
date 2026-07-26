"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { TMDBPersonImages } from '@/features/shared/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';

interface CastGalleryProps {
  images?: TMDBPersonImages;
}

export function CastGallery({ images }: CastGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null || !images?.profiles) return;
    
    if (e.key === 'ArrowRight') {
      setSelectedIndex(prev => (prev !== null && prev < images.profiles.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }
  }, [selectedIndex, images]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!images || !images.profiles || images.profiles.length === 0) return null;

  const galleryImages = images.profiles.slice(0, 8);
  const totalImages = images.profiles.length;
  const hasMore = totalImages > 8;

  if (galleryImages.length <= 1) return null; // Not enough for a gallery

  const selectedImageObj = selectedIndex !== null ? images.profiles[selectedIndex] : null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Media Gallery</h2>
          <span className="text-zinc-500 font-medium">{totalImages} Photos</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((img, idx) => {
            const isLast = idx === 7;
            
            return (
              <div 
                key={idx} 
                className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedIndex(idx)}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w300${img.file_path}`}
                  alt="Gallery Image"
                  fill
                  className={`object-cover transition-transform duration-500 ${!isLast || !hasMore ? 'group-hover:scale-110' : ''}`}
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {isLast && hasMore && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-colors hover:bg-black/80">
                    <span className="text-2xl font-light mb-1">+{totalImages - 8}</span>
                    <span className="text-sm font-semibold uppercase tracking-wider">View All</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-6xl w-full p-0 bg-black/95 border-zinc-800 overflow-hidden h-[90vh] md:h-[85vh]">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {selectedImageObj && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              
              <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
                <span className="text-zinc-400 font-medium text-sm">
                  {selectedIndex! + 1} of {totalImages}
                </span>
                <DialogClose asChild>
                  <button className="bg-white/10 hover:bg-white/20 rounded-full p-2 text-white backdrop-blur-md transition-colors border border-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </DialogClose>
              </div>

              {selectedIndex! > 0 && (
                <button 
                  onClick={() => setSelectedIndex(prev => prev! - 1)}
                  className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white backdrop-blur-md transition-colors border border-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {selectedIndex! < totalImages - 1 && (
                <button 
                  onClick={() => setSelectedIndex(prev => prev! + 1)}
                  className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 text-white backdrop-blur-md transition-colors border border-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <div className="relative w-full h-full max-h-full p-8 md:p-16 flex items-center justify-center">
                <Image
                  src={`https://image.tmdb.org/t/p/original${selectedImageObj.file_path}`}
                  alt="Enlarged gallery view"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
