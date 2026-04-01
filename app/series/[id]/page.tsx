"use client";

import { use } from "react";
import { ProfileProvider } from "@/contexts/ProfileContext";
import BingeSeriesInfo from "@/components/series/BingeSeriesInfo";
import InfoNotFound from "@/components/not-found/InfoNotFound";

interface SeriesDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SeriesDetailsPage({
  params,
}: SeriesDetailsPageProps) {
  const { id } = use(params);
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
