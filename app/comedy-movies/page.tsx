import { Metadata } from "next";
import PaginatedMediaPage from "@/components/info/PaginatedMediaPage";

export const metadata: Metadata = {
  title: "Comedy Movies | MovieFlix",
  description: "Browse hilarious comedy movies. From laugh-out-loud comedies to witty satires.",
  openGraph: {
    title: "Comedy Movies | MovieFlix",
    description: "Discover the best comedy movies with advanced filtering and pagination.",
    type: "website",
  },
};

export default function ComedyMoviesPage() {
  return (
    <PaginatedMediaPage
      title="Comedy Movies"
      description="Side-splitting comedies and feel-good movies"
      mediaType="movie"
      category="popular"
      genreId={35} // Comedy genre ID
      itemsPerPage={20}
    />
  );
}
