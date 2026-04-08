import { Suspense } from "react";
import InfoNotFound from "@/components/not-found/InfoNotFound";
import EnhancedMovieInfo from "@/components/movie/EnhancedMovieInfo";
import BingeSeriesInfo from "@/components/series/BingeSeriesInfo";
import { ProfileProvider } from "@/contexts/ProfileContext";

interface NewPopularDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function NewPopularDetailPage({
  params,
  searchParams,
}: NewPopularDetailPageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return <InfoNotFound />;
  }

  if (type === "tv") {
    return (
      <ProfileProvider>
        <BingeSeriesInfo id={parsedId} />
      </ProfileProvider>
    );
  }

  // Default to movie layout
  return <EnhancedMovieInfo id={parsedId} />;
}
