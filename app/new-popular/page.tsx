import { Metadata } from "next";
import { Suspense } from "react";
import NewAndPopularClient from "../../components/newpopular/NewAndPopularClient";
import { PageLoading } from "../../components/loading/PageLoading";

export const metadata: Metadata = {
  title: "New & Popular | MovieFlix",
  description: "Discover the hottest movies and TV shows trending worldwide, curated with advanced algorithms for the ultimate viewing experience.",
};

export default function NewAndPopularPage() {
  return (
    <Suspense fallback={<PageLoading>Loading New & Popular...</PageLoading>}>
      <NewAndPopularClient />
    </Suspense>
  );
}
