import { Metadata } from "next";
import PaginatedMediaPage from "@/components/info/PaginatedMediaPage";

export const metadata: Metadata = {
  title: "Top Web Series | MovieFlix",
  description: "Browse the most popular web series and streaming shows. Binge-worthy content awaits.",
  openGraph: {
    title: "Top Web Series | MovieFlix",
    description: "Discover the best web series with advanced filtering and pagination.",
    type: "website",
  },
};

export default function TopWebSeriesPage() {
  return (
    <PaginatedMediaPage
      title="Top Web Series"
      description="Trending streaming series and must-watch shows"
      mediaType="tv"
      category="popular"
      itemsPerPage={20}
    />
  );
}
