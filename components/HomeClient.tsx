"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Hero from "@/components/hero/Hero";
import TimeBasedDiscovery from "@/components/discovery/TimeBasedDiscovery";
import RecommendedForYou from "@/components/recommendations/RecommendedForYou";
import Top10India from "@/components/india/Top10India";
import ComingSoon from "@/components/upcoming/ComingSoon";
import BecauseYouWatchedCarousel from "@/components/recommendations/BecauseYouWatchedCarousel";
import NewReleasesCarousel from "@/components/releases/NewReleasesCarousel";
import ContinueWatchingSeries from "@/components/episodes/ContinueWatchingSeries";
import CategorySection from "@/components/info/CategorySection";
import ContinueWatchingSection from "@/components/info/ContinueWatchingSection";
import TrendingNow from "@/components/info/TrendingNow";
import ActionSection from "@/components/info/ActionSection";
import GenreSection from "@/components/info/GenreSection";
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
import OnboardingCard from "@/components/OnboardingCard";

export default function HomePage() {
  return <HomeClient />;
}

function HomeClient() {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastWatchedMovie, setLastWatchedMovie] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Only show onboarding if user is authenticated AND hasn't completed onboarding
    if (status === "authenticated" && session?.user && !session.user.onboardingCompleted) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }

    // Get last watched movie from localStorage
    const lastWatched = localStorage.getItem('lastWatchedMovie');
    if (lastWatched) {
      try {
        const movieData = JSON.parse(lastWatched);
        setLastWatchedMovie(movieData);
      } catch (e) {
        console.error('Error parsing last watched movie:', e);
      }
    } else {
      // Default fallback movie
      setLastWatchedMovie({ name: "Action Movie", id: "123" });
    }
  }, [session, status]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // The session should be updated by the API, no need to reload
  };

  return (
    <div className="bg-[#000000] relative">
      {showOnboarding && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowOnboarding(false)}
          />

          <div className="relative z-10 w-full max-w-md">
            <OnboardingCard onComplete={handleOnboardingComplete} />
          </div>
        </div>
      )}

      {/* Hero Section - Full viewport width, no container constraints */}
      <div className="relative w-full">
        <Hero />
      </div>

      <div className="relative z-10 pt-8">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <TimeBasedDiscovery />
            <NewReleasesCarousel />
            <ContinueWatchingSeries />
            <RecommendedForYou userName={session?.user?.name || "User"} />
            <Top10India />
            <ComingSoon />
            <BecauseYouWatchedCarousel movieName={lastWatchedMovie?.name || "Action Movie"} movieId={lastWatchedMovie?.id} />
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
            <PopularIndiaCarousel />
            <CrimeMysteryCarousel />
            <ActionSection />
            <CreepyCarouselSimple />
            <DramaCarousel />
            <PopularHollywoodCarousel />
            <QuickWatchCarousel />
            <PopularCelebritiesCarousel />
            <BingeWorthySeriesCarousel />
            <AnimeCarousel />
            <HorrorCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}
