"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clip } from "@/lib/scenes/types";
import { CAROUSEL_CONFIGS } from "@/lib/scenes/carouselData";
import SceneHero from "@/features/social/components/scenes/SceneHero";
import SceneCarousel from "@/features/social/components/scenes/SceneCarousel";
import SceneSearch from "@/features/social/components/scenes/SceneSearch";
import PlayerModal from "@/features/social/components/scenes/PlayerModal";
import "./scenes.css";

// Category group labels for section dividers
const CATEGORY_GROUPS: Record<number, string> = {
  0: "🔥 High Engagement",
  10: "📱 Gen Z Viral",
  15: "👊 Action",
  20: "💔 Emotional",
  24: "✨ Cinematic Craft",
};

export default function ScenesPage() {
  const [activeClips, setActiveClips] = useState<Clip[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  // Standard smooth scrolling without Lenis
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const handlePlayClip = useCallback((clip: Clip, list: Clip[]) => {
    const index = list.findIndex(c => c.id === clip.id);
    setActiveClips(list);
    setActiveIndex(index >= 0 ? index : 0);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setActiveClips([]);
    setActiveIndex(-1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="scenes-page-bg">
      {/* Cinematic Hero with Integrated Search */}
      <SceneHero onSearch={handleSearch} />

      {/* Dynamic search results carousel */}
      {searchQuery && (
        <div className="mb-4">
          <SceneCarousel
            key={`search-${searchQuery}`}
            id="search-results"
            title={`Results for "${searchQuery}"`}
            icon="🔍"
            query={searchQuery}
            onPlayClip={handlePlayClip}
            index={-1}
          />
          <div className="scene-section-divider mx-4 md:mx-12" />
        </div>
      )}

      {/* 27 Curated Carousels */}
      <div className="pb-20">
        {CAROUSEL_CONFIGS.map((config, index) => (
          <div key={config.id}>
            {/* Category group header at section boundaries */}
            {CATEGORY_GROUPS[index] && (
              <div className="pt-6 pb-2">
                {index > 0 && <div className="scene-section-divider mx-4 md:mx-12 mb-4" />}
                <p className="scene-category-header">{CATEGORY_GROUPS[index]}</p>
              </div>
            )}

            <SceneCarousel
              id={config.id}
              title={config.title}
              icon={config.icon}
              query={config.query}
              onPlayClip={handlePlayClip}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Player Modal */}
      <PlayerModal 
        clips={activeClips} 
        startIndex={activeIndex} 
        onClose={handleClosePlayer} 
      />
    </div>
  );
}
