import { Metadata } from "next";
import { Suspense } from "react";
import PageTitle from "@/components/title/PageTitle";
import EnhancedMoviePageClient from "@/components/movie/EnhancedMoviePageClient";
import {PageLoading} from "@/components/loading/PageLoading";

export const metadata: Metadata = {
  title: "All Movies | MovieFlix",
  description:
    "Browse all movies available on MovieFlix. Find trending, top-rated, and new releases.",
};

export default function MoviePage() {
  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle
        segments={[{ text: "All" }, { text: " Movies", isPrimary: true }]}
      />

      <Suspense fallback={<PageLoading>Loading movies...</PageLoading>}>
        <EnhancedMoviePageClient />
      </Suspense>
    </div>
  );
}
