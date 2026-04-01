"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import OnboardingCard from "@/components/OnboardingCard";
import HeroSection from "@/components/hero/HeroSection";
import TimeBasedDiscovery from "@/components/discovery/TimeBasedDiscovery";
import CategorySection from "@/components/info/CategorySection";
import ContinueWatchingSection from "@/components/info/ContinueWatchingSection";
import TrendingNow from "@/components/info/TrendingNow";
import ActionSection from "@/components/info/ActionSection";
import PopularCelebritiesCarousel from "@/components/celebrities/PopularCelebritiesCarousel";
import AnimeCarousel from "@/components/anime/AnimeCarousel";
import HorrorCarousel from "@/components/horror/HorrorCarousel";
import CrimeMysteryCarousel from "@/components/crime-mystery/CrimeMysteryCarousel";
import DramaCarousel from "@/components/drama/DramaCarousel";
import PopularIndiaCarousel from "@/components/regional/PopularIndiaCarousel";
import PopularHollywoodCarousel from "@/components/regional/PopularHollywoodCarousel";
import HiddenGemsCarousel from "@/components/special/HiddenGemsCarousel";
import QuickWatchCarousel from "@/components/special/QuickWatchCarousel";
import BingeWorthySeriesCarousel from "@/components/special/BingeWorthySeriesCarousel";
import CreepyCarouselSimple from "@/components/carousels/CreepyCarouselSimple";

export default function HomeWithOnboarding() {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (session && !session.user?.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [session, status]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reload page to update session
    window.location.reload();
  };

  return (
    <div className="bg-[#000000] relative">
      {/* Onboarding Modal Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowOnboarding(false)}
          />
          
          {/* Onboarding Card */}
          <div className="relative z-10 w-full max-w-md">
            <OnboardingCard onComplete={handleOnboardingComplete} {...{}} />
          </div>
        </div>
      )}
      
      <HeroSection />
      <div className="relative z-10 pt-8">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <TimeBasedDiscovery />
            <ContinueWatchingSection />
            <TrendingNow />
            <CategorySection
              title="Top Rated Movies"
              mediaType="movie"
              category="top_rated"
              seeAllHref="/movie?category=top_rated"
            />
            <CategorySection
              title="Popular Movies"
              mediaType="movie"
              category="popular"
              seeAllHref="/movie?category=popular"
            />
            <HiddenGemsCarousel />
            <CategorySection
              title="Top Rated TV Shows"
              mediaType="tv"
              category="top_rated"
              seeAllHref="/series?category=top_rated"
            />
            <CategorySection
              title="Popular TV Shows"
              mediaType="tv"
              category="popular"
              seeAllHref="/series?category=popular"
            />
            <ActionSection />
            <PopularCelebritiesCarousel />
            <AnimeCarousel />
            <HorrorCarousel />
            <CrimeMysteryCarousel />
            <DramaCarousel />
            <PopularIndiaCarousel />
            <PopularHollywoodCarousel />
            <QuickWatchCarousel />
            <BingeWorthySeriesCarousel />
            <CreepyCarouselSimple />
          </div>
        </div>
      </div>
    </div>
  );
}
