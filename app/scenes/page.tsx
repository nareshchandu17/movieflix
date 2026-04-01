"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clip } from "@/lib/scenes/types";
import { CAROUSEL_CONFIGS } from "@/lib/scenes/carouselData";
import SceneHero from "@/components/scenes/SceneHero";
import SceneCarousel from "@/components/scenes/SceneCarousel";
import SceneSearch from "@/components/scenes/SceneSearch";
import PlayerModal from "@/components/scenes/PlayerModal";
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
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Standard smooth scrolling without Lenis
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  const handlePlayClip = useCallback((clip: Clip) => {
    setSelectedClip(clip);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setSelectedClip(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="scenes-page-bg">
      {/* Cinematic Hero */}
      <SceneHero />

      {/* Search Bar */}
      <SceneSearch onSearch={handleSearch} />

      {/* Dynamic search results carousel */}
      {searchQuery && (
        <div className="mb-4">
          <SceneCarousel
            key={`search-${searchQuery}`}
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
      <PlayerModal clip={selectedClip} onClose={handleClosePlayer} />
    </div>
  );
}
