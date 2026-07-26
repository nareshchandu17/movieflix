import { ProfileProvider } from "@/features/profile/components/ProfileContext";
import InfoNotFound from "@/features/shared/components/not-found/InfoNotFound";
import dynamic from "next/dynamic";
import { InfoLoading } from "@/features/shared/components/loading/PageLoading";

const BingeSeriesInfo = dynamic(() => import("@/features/series/components/series/BingeSeriesInfo"), {
  loading: () => <InfoLoading />,
});

interface SeriesDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SeriesDetailsPage({
  params,
}: SeriesDetailsPageProps) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return <InfoNotFound type="tv" />;
  }

  return (
    <ProfileProvider>
      <BingeSeriesInfo id={parsedId} />
    </ProfileProvider>
  );
}
