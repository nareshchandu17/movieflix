import { useState, useMemo } from 'react';
import { 
  useSeriesDetailsQuery, 
  useSeriesCreditsQuery, 
  useSimilarSeriesQuery, 
  useSeriesSeasonQuery, 
  useSeriesVideosQuery,
  useSeriesScenesQuery 
} from '../queries/seriesQueries';
import { TMDBCrew } from '@/lib/types';

export const useSeriesDetails = (id: number) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodeSortOrder, setEpisodeSortOrder] = useState<'asc' | 'desc'>('asc');

  // Parallel Queries
  const { data: seriesData, isLoading: isSeriesLoading } = useSeriesDetailsQuery(id);
  const { data: creditsData } = useSeriesCreditsQuery(id);
  const { data: similarData } = useSimilarSeriesQuery(id);
  const { data: videosData } = useSeriesVideosQuery(id);
  
  // Dependent Queries
  const { data: seasonData, isLoading: isSeasonLoading } = useSeriesSeasonQuery(id, selectedSeason);
  const { data: scenesData } = useSeriesScenesQuery(seriesData?.name || '');

  // Derived State / Selectors
  const cast = useMemo(() => creditsData?.cast?.slice(0, 15) || [], [creditsData]);
  
  const crew = useMemo(() => {
    return creditsData?.crew?.filter((person: TMDBCrew) =>
      ['Director', 'Executive Producer', 'Producer', 'Writer', 'Creator'].includes(person.job)
    ).slice(0, 10) || [];
  }, [creditsData]);

  const similarSeries = useMemo(() => {
    return similarData?.results?.filter(item => 'name' in item).slice(0, 8) || [];
  }, [similarData]);

  const trailerKey = useMemo(() => {
    return videosData?.results?.find(video => video.type === "Trailer" && video.site === "YouTube")?.key || null;
  }, [videosData]);

  const episodes = useMemo(() => {
    if (!seasonData?.episodes) return [];
    const mapped = seasonData.episodes.map((episode, index) => ({
      episode,
      progress: Math.random() * 100, // Simulated
      isWatched: Math.random() > 0.3, // Simulated
      isCurrent: index === 3 // Simulated
    }));

    return mapped.sort((a, b) => {
      if (episodeSortOrder === 'asc') {
        return a.episode.episode_number - b.episode.episode_number;
      } else {
        return b.episode.episode_number - a.episode.episode_number;
      }
    });
  }, [seasonData, episodeSortOrder]);

  return {
    seriesData,
    isLoading: isSeriesLoading,
    cast,
    crew,
    similarSeries,
    trailerKey,
    scenesData,
    seasons: seriesData?.seasons || [],
    selectedSeason,
    setSelectedSeason,
    episodes,
    isSeasonLoading,
    episodeSortOrder,
    setEpisodeSortOrder,
  };
};

