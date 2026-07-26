"use client";

import { useEffect } from "react";
import ContinueWatchingSeries from "../episodes/ContinueWatchingSeries";
import MovieCarousel from "@/features/shared/components/display/MovieCarousel";
import ContentEngine from "@/services/content-engine";

const SeriesCarousels = () => {
  useEffect(() => {
    ContentEngine.deduplication.reset("series");
  }, []);

  return (
    <div className="space-y-12">
      <ContinueWatchingSeries />

      <MovieCarousel
        strategy="trending"
        title="Trending Now"
        subtitle="Top Daily & Weekly Hits"
        seeAllHref="/see-all?strategy=trending&title=Trending+Now"
        pageKey="series"
      />

      <MovieCarousel
        strategy="recommended"
        title="Top Picks For You"
        subtitle="Algorithmic TV Recommendations"
        seeAllHref="/see-all?strategy=recommended&title=Top+Picks+For+You"
        pageKey="series"
      />

      <MovieCarousel
        strategy="top10-india"
        title="Top 10 in India Today"
        subtitle="Most Watched Indian Shows"
        seeAllHref="/see-all?strategy=top10-india&title=Top+10+in+India+Today"
        pageKey="series"
      />

      <MovieCarousel
        strategy="new-releases"
        title="New Episodes This Week"
        subtitle="Fresh Season Drops"
        seeAllHref="/see-all?strategy=new-releases&title=New+Episodes+This+Week"
        pageKey="series"
      />

      <MovieCarousel
        strategy="because-you-watched"
        title="Because You Watched Breaking Bad"
        subtitle="High-Affinity Drama & Crime"
        seeAllHref="/see-all?strategy=because-you-watched&title=Because+You+Watched+Breaking+Bad"
        pageKey="series"
        options={{ lastWatchedId: 1396 }}
      />

      <MovieCarousel
        strategy="weekend-binge"
        title="Binge-Worthy Series"
        subtitle="High-Retention TV Masterpieces"
        seeAllHref="/see-all?strategy=weekend-binge&title=Binge-Worthy+Series"
        pageKey="series"
      />

      <MovieCarousel
        strategy="top-rated"
        title="Top Rated Series"
        subtitle="All-Time Critically Acclaimed"
        seeAllHref="/see-all?strategy=top-rated&title=Top+Rated+Series"
        pageKey="series"
      />

      <MovieCarousel
        strategy="action-adventure"
        title="Action & Adventure"
        subtitle="High-Octane TV series"
        seeAllHref="/see-all?strategy=action-adventure&title=Action+%26+Adventure"
        pageKey="series"
      />

      <MovieCarousel
        strategy="crime"
        title="Crime Series"
        subtitle="Whodunits & Suspense"
        seeAllHref="/see-all?strategy=crime&title=Crime+Series"
        pageKey="series"
      />

      <MovieCarousel
        strategy="mind-bending"
        title="Sci-Fi & Fantasy"
        subtitle="Mind Bending & Futuristic"
        seeAllHref="/see-all?strategy=mind-bending&title=Sci-Fi+%26+Fantasy"
        pageKey="series"
      />

      <MovieCarousel
        strategy="sports"
        title="Sports & Fitness"
        subtitle="Sports Documentaries & Dramas"
        seeAllHref="/see-all?strategy=sports&title=Sports+%26+Fitness"
        pageKey="series"
      />

      <MovieCarousel
        strategy="anime"
        title="Animation & Cartoons"
        subtitle="Top Anime Series"
        seeAllHref="/see-all?strategy=anime&title=Animation+%26+Cartoons"
        pageKey="series"
      />
    </div>
  );
};

export default SeriesCarousels;
