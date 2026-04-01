import { Metadata } from "next";
import InfoNotFound from "@/components/not-found/InfoNotFound";
import EnhancedMovieInfo from "@/components/movie/EnhancedMovieInfo";

export const metadata: Metadata = {
  title: "Movie | Cineworld",
  description:
    "Browse all movies available on Cineworld. Find trending, top-rated, and new releases.",
};

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return <InfoNotFound />;
  }

  return <EnhancedMovieInfo id={parsedId} />;
}
