"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import Header from "@/features/shared/components/navbar/Header";
import Hero from "@/features/home/components/hero/Hero";
import ContinueWatchingSeries from "@/features/series/components/episodes/ContinueWatchingSeries";
import PopularCelebritiesCarousel from "@/features/movie/components/celebrities/PopularCelebritiesCarousel";
import MovieCarousel from "@/features/shared/components/display/MovieCarousel";
import { LazySection } from "@/features/shared/components/ui/LazySection";
import { SubscriptionGate } from "@/features/payments/components/payments/SubscriptionGate";
import { useProfile } from "@/features/profile/components/ProfileContext";
import { GlobalDeduplicationManager } from "@/lib/curation/engine";
import ContentEngine from "@/services/content-engine";
import type { ServerSideProfileState } from "@/features/profile/services/server-side-profile";

export default function HomePage(props: HomeClientProps) {
  return <HomeClient {...props} />;
}

interface HomeClientProps {
  serverProfileState?: ServerSideProfileState;
}

function HomeClient({ serverProfileState }: HomeClientProps = {}) {
  const { data: session, status } = useSession();
  const { activeProfile } = useProfile();
  const [lastWatchedMovie, setLastWatchedMovie] = useState<{ name: string; id: string } | null>(null);

  useEffect(() => {
    // Reset global deduplication registry on homepage mount
    GlobalDeduplicationManager.reset();
    ContentEngine.deduplication.reset("home");

    if (status === "loading") return;

    const lastWatched = localStorage.getItem('lastWatchedMovie');
    if (lastWatched) {
      try {
        const movieData = JSON.parse(lastWatched);
        setLastWatchedMovie(movieData);
      } catch (e) {
        console.error('Error parsing last watched movie:', e);
      }
    } else {
      setLastWatchedMovie({ name: "Action Movie", id: "27205" });
    }
  }, [session, status]);

  return (
    <div className="bg-[#000000] relative">
      <Header />
      {/* Hero Section - Full viewport width */}
      <div className="relative w-full">
        <Hero />
      </div>

      <div className="relative z-10 pt-8 pb-24 overflow-x-hidden flex flex-col">
        {/* Top fold quick resumption & discovery */}
          <ContinueWatchingSeries />

          <MovieCarousel
            strategy="trending"
            title="Trending Now"
            subtitle="Top Daily & Weekly Hits"
            seeAllHref="/see-all?strategy=trending&title=Trending+Now"
            pageKey="home"
          />

          {/* Repositioned below Trending as required by UX specifications */}
          <MovieCarousel
            strategy="time-based"
            title="Good Morning / Tonight Picks"
            subtitle="Time-Aware Discovery"
            seeAllHref="/see-all?strategy=time-based&title=Good+Morning+%2F+Tonight+Picks"
            pageKey="home"
          />

          {/* Below-the-fold Lazy Loaded Curated Sections */}
          <LazySection placeholderTitle="Recommended For You">
            <MovieCarousel
              strategy="recommended"
              title="Recommended For You"
              subtitle="Algorithmic Top Picks"
              seeAllHref="/see-all?strategy=recommended&title=Recommended+For+You"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Because You Watched">
            <MovieCarousel
              strategy="because-you-watched"
              title={`Because You Watched ${lastWatchedMovie?.name || "Recent Hits"}`}
              subtitle="Personalized Affinity"
              seeAllHref={`/see-all?strategy=because-you-watched&title=Because+You+Watched+${encodeURIComponent(lastWatchedMovie?.name || "Recent Hits")}`}
              pageKey="home"
              options={{ lastWatchedId: Number(lastWatchedMovie?.id) || undefined }}
            />
          </LazySection>

          <LazySection placeholderTitle="New Releases">
            <MovieCarousel
              strategy="new-releases"
              title="New Releases"
              subtitle="Fresh Theatrical & Digital Drops"
              seeAllHref="/see-all?strategy=new-releases&title=New+Releases"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Top 10 in India">
            <MovieCarousel
              strategy="top10-india"
              title="Top 10 in India"
              subtitle="Pan-Indian Blockbusters"
              seeAllHref="/see-all?strategy=top10-india&title=Top+10+in+India"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Award Winners">
            <MovieCarousel
              strategy="award-winners"
              title="Award Winners"
              subtitle="Critically Acclaimed Masterpieces"
              seeAllHref="/see-all?strategy=award-winners&title=Award+Winners"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Weekend Binge">
            <MovieCarousel
              strategy="weekend-binge"
              title="Weekend Binge"
              subtitle="High-Retention TV Series"
              seeAllHref="/see-all?strategy=weekend-binge&title=Weekend+Binge"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Sports & Fitness Series">
            <MovieCarousel
              strategy="sports"
              title="Sports & Fitness Series"
              subtitle="Adrenaline & Documentaries"
              seeAllHref="/see-all?strategy=sports&title=Sports+%26+Fitness+Series"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Action & Adventure">
            <MovieCarousel
              strategy="action-adventure"
              title="Action & Adventure"
              subtitle="High-Octane Blockbusters"
              seeAllHref="/see-all?strategy=action-adventure&title=Action+%26+Adventure"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Crime & Mystery">
            <MovieCarousel
              strategy="crime"
              title="Crime & Mystery"
              subtitle="Whodunits & Neo-Noir Suspense"
              seeAllHref="/see-all?strategy=crime&title=Crime+%26+Mystery"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Mind Bending">
            <MovieCarousel
              strategy="mind-bending"
              title="Mind Bending"
              subtitle="Sci-Fi & Psychological Twists"
              seeAllHref="/see-all?strategy=mind-bending&title=Mind+Bending"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Creepy & Disturbing">
            <MovieCarousel
              strategy="creepy-disturbing"
              title="Creepy & Disturbing"
              subtitle="Dark Horror & Cult Thrillers"
              seeAllHref="/see-all?strategy=creepy-disturbing&title=Creepy+%26+Disturbing"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Top Rated">
            <MovieCarousel
              strategy="top-rated"
              title="Top Rated"
              subtitle="All-Time Movies & Series Combined"
              seeAllHref="/see-all?strategy=top-rated&title=Top+Rated"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Hidden Gems">
            <MovieCarousel
              strategy="hidden-gems"
              title="Hidden Gems"
              subtitle="Under-the-Radar Masterpieces"
              seeAllHref="/see-all?strategy=hidden-gems&title=Hidden+Gems"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Around The World">
            <MovieCarousel
              strategy="around-the-world"
              title="Around The World"
              subtitle="International Cinema Showcase"
              seeAllHref="/see-all?strategy=around-the-world&title=Around+The+World"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Anime Favorites">
            <MovieCarousel
              strategy="anime"
              title="Anime Favorites"
              subtitle="Authentic Japanese Animation"
              seeAllHref="/see-all?strategy=anime&title=Anime+Favorites"
              pageKey="home"
            />
          </LazySection>

          <LazySection placeholderTitle="Popular Celebrities">
            <PopularCelebritiesCarousel />
          </LazySection>

          {/* Subscribe CTA Banner */}
          <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 shadow-2xl">
              {/* Abstract background shapes */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
              
              <div className="relative z-10 px-6 py-12 sm:p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                  Unlock Premium Entertainment
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                  Get unlimited access to thousands of exclusive movies, award-winning series, and original documentaries in stunning 4K Ultra HD.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <a href="/pricing" className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/30 transform hover:scale-105 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Subscribe Now
                  </a>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
