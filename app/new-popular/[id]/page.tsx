import { Suspense } from "react";
import InfoNotFound from "@/features/shared/components/not-found/InfoNotFound";
import { ProfileProvider } from "@/features/profile/components/ProfileContext";
import dynamic from "next/dynamic";
import { InfoLoading } from "@/features/shared/components/loading/PageLoading";

const EnhancedMovieInfo = dynamic(() => import("@/features/movie/components/movie/EnhancedMovieInfo"), {
  loading: () => <InfoLoading />,
});

const BingeSeriesInfo = dynamic(() => import("@/features/series/components/series/BingeSeriesInfo"), {
  loading: () => <InfoLoading />,
});

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
