"use client";
import React, { useEffect, useState } from "react";
import MediaDetailLayout from "@/features/shared/components/layout/MediaDetailLayout";
import MediaPoster from "@/features/shared/components/display/MediaPoster";
import MediaMeta from "@/features/movie/components/info/MediaMeta";
import SeasonDisplay from "./SeasonDisplay";
import DidYouKnowSection from "@/features/movie/components/info/DidYouKnowSection";
import { Genre, TMDBTVDetail } from "@/lib/types";
import { InfoLoading } from "@/features/shared/components/loading/PageLoading";
import { api } from "@/lib/api";
import InfoNotFound from "@/features/shared/components/not-found/InfoNotFound";

interface SeriesData {
  data: TMDBTVDetail | null;
  genreArr: string[];
  id: number;
}

interface TvInfoProps {
  id: number;
}

const TvInfo = ({ id }: TvInfoProps) => {
  const [seriesData, setSeriesData] = useState<SeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSeriesDetails = async () => {
      // Validate ID format
      const parsedId = parseInt(id.toString(), 10);
      if (
        isNaN(parsedId) ||
        parsedId <= 0 ||
        !/^\d+$/.test(id.toString().trim())
      ) {
        console.error("[SeriesDetail] Invalid series ID format:", id);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log(
          `[SeriesDetail] Fetching series details for ID: ${parsedId}`
        );
        const data = (await api.getDetails("tv", parsedId)) as TMDBTVDetail;

        if (!isMounted) return;

        const genreArr = data.genres?.map((genre: Genre) => genre.name) || [];
        setSeriesData({ data, genreArr, id: parsedId });

        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;

        const error_ = error as Error & { status?: number; code?: string };

        // Check if it's a 404 not found error
        if (error_.status === 404 || error_.code === "NOT_FOUND") {

          setNotFound(true);
          setIsLoading(false);
        } else {
          // For other errors, show error state
          console.error(
            "[SeriesDetail] Failed to fetch series details:",
            error_
          );
          setNotFound(true); // Show not found for any error for now
          setIsLoading(false);
        }
      }
    };

    fetchSeriesDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Not Found State
  if (notFound) {
    return <InfoNotFound type="tv" />;
  }

  // Loading State - will show until data is successfully loaded
  if (isLoading || !seriesData?.data) {
    return <InfoLoading>Loading Series Details</InfoLoading>;
  }

  // Guaranteed non-null data after this point
  const tvDetail = seriesData.data;
  const genreArr = seriesData.genreArr;
  
  // Defensive extraction with safe defaults
  const seasons = tvDetail.seasons ?? [];
  const seasonCount = tvDetail.number_of_seasons ?? 0;
  const episodeCount = tvDetail.number_of_episodes ?? 0;

  const title = tvDetail.name || tvDetail.original_name || "Unknown Title";
  const firstAirYear = tvDetail.first_air_date
    ? tvDetail.first_air_date.slice(0, 4)
    : undefined;

  // Convert tvDetail to TMDBTVShow format for WatchlistButton
  const mediaForWatchlist = {
    id: tvDetail.id,
    name: tvDetail.name,
    overview: tvDetail.overview,
    poster_path: tvDetail.poster_path,
    backdrop_path: tvDetail.backdrop_path,
    first_air_date: tvDetail.first_air_date || "",
    vote_average: tvDetail.vote_average,
    vote_count: tvDetail.vote_count,
    popularity: tvDetail.popularity,
    genre_ids: tvDetail.genres?.map((g) => g.id).filter((id): id is number => id !== undefined) || [],
    origin_country: tvDetail.origin_country,
    original_language: tvDetail.original_language,
    original_name: tvDetail.original_name,
    adult: false,
  };

  return (
    <MediaDetailLayout className="pt-16">
      <div className="space-y-8 lg:space-y-12">
        {/* Hero Section - Poster and Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Poster */}
          <div className="lg:col-span-1">
            <MediaPoster
              posterPath={tvDetail.poster_path}
              title={title}
              className="mx-auto lg:mx-0"
            />
          </div>

          {/* Metadata */}
          <div className="lg:col-span-3">
            <MediaMeta
              type="tv"
              title={title}
              year={firstAirYear}
              rating={tvDetail.vote_average}
              ratingCount={tvDetail.vote_count}
              seasons={seasonCount}
              episodes={episodeCount}
              genres={genreArr}
              overview={tvDetail.overview}
              media={mediaForWatchlist}
            />
          </div>
        </div>

        {/* Seasons Section */}
        {seasons.length > 0 && (
          <div className="glass-container">
            <div className="space-y-6">
              <>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Seasons & Episodes
                </h2>
                <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              </>

              <SeasonDisplay
                key={tvDetail.id}
                SeasonCards={seasons}
                TvDetails={tvDetail}
              />
            </div>
          </div>
        )}

        {/* Did You Know Section - Full Width */}
        <div className="max-w-6xl mx-auto">
          <DidYouKnowSection title={title} movieData={tvDetail} />
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default TvInfo;

