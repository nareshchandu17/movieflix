import { Metadata } from "next";
import { Suspense } from "react";
import SeriesPageClient from "@/components/series/SeriesPageClient";
import {PageLoading} from "@/components/loading/PageLoading";

export const metadata: Metadata = {
  title: "All TV Shows | MovieFlix",
  description:
    "Browse all TV shows available on MovieFlix. Find trending, top-rated, and new releases.",
};

export default function SeriesPage() {
  return (
    <div className="app-bg-enhanced">
      <Suspense fallback={<PageLoading>Loading TV shows...</PageLoading>}>
        <SeriesPageClient />
      </Suspense>
    </div>
  );
}
