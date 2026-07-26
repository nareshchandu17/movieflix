"use client";

import { useEffect, useState, useCallback, use } from "react";
import { CAROUSEL_CONFIGS } from "@/lib/scenes/carouselData";
import { useScenes } from "@/features/social/hooks/useScenes";
import { Clip } from "@/lib/scenes/types";
import ClipCard from "@/features/social/components/scenes/ClipCard";
import PlayerModal from "@/features/social/components/scenes/PlayerModal";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import Link from "next/link";
import "../../scenes.css";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  
  const config = CAROUSEL_CONFIGS.find((c) => c.id === slug);
  const { clips, isLoading } = useScenes(config?.query || null);

  const handlePlayClip = useCallback((clip: Clip) => {
    setSelectedClip(clip);
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Link href="/scenes" className="text-red-500 hover:underline">Return to Scenes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="scenes-page-bg min-h-screen pb-20">
      {/* Header */}
      <div className="pt-24 pb-10 px-4 md:px-12 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/scenes"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            BACK TO SCENES
          </Link>
          
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl">{config.icon}</span>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                  {config.title}
                </h1>
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                  <FiGrid className="text-red-500" />
                  EXPLORING ALL CURATED CLIPS
                </p>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <span className="block text-2xl font-mono text-white leading-none">
                {clips.length}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Clips</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video w-full rounded-xl scene-skeleton animate-pulse"
              />
            ))}
          </div>
        ) : clips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 justify-items-center">
            {clips.map((clip) => (
              <div key={clip.id} className="w-full max-w-[320px]">
                <ClipCard clip={clip} onPlay={handlePlayClip} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-lg italic">No scenes found in this category.</p>
          </div>
        )}
      </div>

      {/* Fullscreen Player Modal (Reels Style) */}
      {selectedClip && (
        <PlayerModal 
          clips={clips} 
          startIndex={Math.max(0, clips.findIndex(c => c.id === selectedClip.id))} 
          onClose={() => setSelectedClip(null)} 
        />
      )}
    </div>
  );
}
