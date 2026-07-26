"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import OnboardingCard from "@/features/home/components/OnboardingCard";
import HeroSection from "@/features/home/components/hero/Hero";
import TimeBasedDiscovery from "@/features/search/components/discovery/TimeBasedDiscovery";
import CategorySection from "@/features/movie/components/info/CategorySection";
import ContinueWatchingSection from "@/features/movie/components/info/ContinueWatchingSection";
import TrendingNow from "@/features/movie/components/info/TrendingNow";
import ActionSection from "@/features/movie/components/info/ActionSection";
import PopularCelebritiesCarousel from "@/features/movie/components/celebrities/PopularCelebritiesCarousel";
import AnimeCarousel from "@/features/home/components/anime/AnimeCarousel";
import HorrorCarousel from "@/features/home/components/horror/HorrorCarousel";
import CrimeMysteryCarousel from "@/features/home/components/crime-mystery/CrimeMysteryCarousel";
import DramaCarousel from "@/features/home/components/drama/DramaCarousel";
import PopularIndiaCarousel from "@/features/home/components/regional/PopularIndiaCarousel";
import PopularHollywoodCarousel from "@/features/home/components/regional/PopularHollywoodCarousel";
import HiddenGemsCarousel from "@/features/home/components/special/HiddenGemsCarousel";
import QuickWatchCarousel from "@/features/home/components/special/QuickWatchCarousel";
import BingeWorthySeriesCarousel from "@/features/home/components/special/BingeWorthySeriesCarousel";
import CreepyCarouselSimple from "@/features/shared/components/carousels/CreepyCarouselSimple";

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
