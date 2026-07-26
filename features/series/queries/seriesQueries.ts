import { useQuery } from '@tanstack/react-query';
import { seriesService } from '../services/seriesService';

export const seriesKeys = {
  all: ['series'] as const,
  insights: (id: number) => [...seriesKeys.all, 'insights', id] as const,
  details: (id: number) => [...seriesKeys.all, 'details', id] as const,
  credits: (id: number) => [...seriesKeys.all, 'credits', id] as const,
  similar: (id: number) => [...seriesKeys.all, 'similar', id] as const,
  season: (id: number, seasonNum: number) => [...seriesKeys.all, 'season', id, seasonNum] as const,
  videos: (id: number) => [...seriesKeys.all, 'videos', id] as const,
  scenes: (name: string) => [...seriesKeys.all, 'scenes', name] as const,
};

export const useAIInsightsQuery = (seriesId: number, seriesTitle: string) => {
  return useQuery({
    queryKey: seriesKeys.insights(seriesId),
    queryFn: () => seriesService.fetchAIInsights(seriesId, seriesTitle),
    enabled: !!seriesId && !!seriesTitle,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useSeriesDetailsQuery = (id: number) => {
  return useQuery({
    queryKey: seriesKeys.details(id),
    queryFn: () => seriesService.fetchDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSeriesCreditsQuery = (id: number) => {
  return useQuery({
    queryKey: seriesKeys.credits(id),
    queryFn: () => seriesService.fetchCredits(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
};

export const useSimilarSeriesQuery = (id: number) => {
  return useQuery({
    queryKey: seriesKeys.similar(id),
    queryFn: () => seriesService.fetchSimilar(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
};

export const useSeriesSeasonQuery = (id: number, seasonNumber: number) => {
  return useQuery({
    queryKey: seriesKeys.season(id, seasonNumber),
    queryFn: () => seriesService.fetchSeasonDetails(id, seasonNumber),
    enabled: !!id && !!seasonNumber,
    staleTime: 1000 * 60 * 60 * 24, // Seasons rarely change once fetched
  });
};

export const useSeriesVideosQuery = (id: number) => {
  return useQuery({
    queryKey: seriesKeys.videos(id),
    queryFn: () => seriesService.fetchVideos(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

export const useSeriesScenesQuery = (seriesName: string) => {
  return useQuery({
    queryKey: seriesKeys.scenes(seriesName),
    queryFn: () => seriesService.fetchScenes(seriesName),
    enabled: !!seriesName,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

