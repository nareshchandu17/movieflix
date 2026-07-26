import { Metadata } from "next";
import { Suspense } from "react";
import PageTitle from "@/features/shared/components/title/PageTitle";
import EnhancedMoviePageClientRefactored from "@/features/movie/components/movie/EnhancedMoviePageClientRefactored";
import {PageLoading} from "@/features/shared/components/loading/PageLoading";
import { MovieErrorBoundary } from "@/features/shared/components/error/MovieErrorBoundary";

export const metadata: Metadata = {
  title: "All Movies | MovieFlix",
  description:
    "Browse all movies available on MovieFlix. Find trending, top-rated, and new releases.",
};

export default function MoviePage() {
  return (
    <div className="app-bg-enhanced pt-20">

      <MovieErrorBoundary>
        <Suspense fallback={<PageLoading>Loading movies...</PageLoading>}>
          <EnhancedMoviePageClientRefactored />
        </Suspense>
      </MovieErrorBoundary>
    </div>
  );
}
