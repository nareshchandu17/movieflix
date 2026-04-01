import { Metadata } from "next";
import PaginatedMediaPage from "@/components/info/PaginatedMediaPage";

export const metadata: Metadata = {
  title: "Popular Action Movies | MovieFlix",
  description: "Browse the most popular action movies. High-octane thrillers and blockbusters await.",
  openGraph: {
    title: "Popular Action Movies | MovieFlix",
    description: "Discover the best action movies with advanced filtering and pagination.",
    type: "website",
  },
};

export default function ActionMoviesPage() {
  return (
    <PaginatedMediaPage
      title="Popular Action Movies"
      description="Adrenaline-pumping blockbusters and thrilling action adventures"
      mediaType="movie"
      category="popular"
      genreId={28} // Action genre ID
      itemsPerPage={20}
    />
  );
}
