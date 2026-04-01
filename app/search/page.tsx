import { Metadata } from "next";
import { Suspense } from "react";
import PageTitle from "@/components/title/PageTitle";
import SearchPageContent from "@/components/search/SearchPageContent";
import {PageLoading} from "@/components/loading/PageLoading";

export const metadata: Metadata = {
  title: "Search | MovieFlix",
  description:
    "Browse all movies and tv shows currently available on MovieFlix. Find trending, top-rated, and new releases.",
};

export default function SearchPage() {
  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle
        segments={[
          { text: "Explore, Discover, and" },
          { text: " Watch", isPrimary: true },
        ]}
      />
      <Suspense fallback={<PageLoading>Loading search...</PageLoading>}>
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
