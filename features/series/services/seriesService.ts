import { api } from "@/lib/api";
import { TMDBTVDetail, TMDBCredits, TMDBTVResponse, TMDBSeasonDetail, TMDBVideosResponse } from "@/lib/types";

export const seriesService = {
  fetchAIInsights: async (seriesId: number, seriesTitle: string) => {
    const response = await fetch('/api/ai-insights/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: seriesId,
        title: seriesTitle,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok && (!data || !data.insights)) {
      throw new Error(data?.error || 'Unable to load AI analysis at this moment.');
    }

    if (!data || !data.insights || !Array.isArray(data.insights)) {
      throw new Error('Unable to load AI analysis at this moment.');
    }

    return data.insights;
  },

  fetchDetails: async (id: number): Promise<TMDBTVDetail> => {
    return await api.getDetails("tv", id) as TMDBTVDetail;
  },

  fetchCredits: async (id: number): Promise<TMDBCredits> => {
    return await api.getCredits("tv", id) as TMDBCredits;
  },

  fetchSimilar: async (id: number): Promise<TMDBTVResponse> => {
    return await api.getSimilar("tv", id) as TMDBTVResponse;
  },

  fetchSeasonDetails: async (id: number, seasonNumber: number): Promise<TMDBSeasonDetail> => {
    return await api.getSeasonDetails(id, seasonNumber) as TMDBSeasonDetail;
  },

  fetchVideos: async (id: number): Promise<TMDBVideosResponse> => {
    return await api.getVideos("tv", id) as TMDBVideosResponse;
  },

  fetchScenes: async (seriesName: string) => {
    const response = await fetch(`/api/scenes?q=${encodeURIComponent(seriesName)} best moments&maxResults=6`);
    if (!response.ok) throw new Error("Failed to fetch scenes");
    return await response.json();
  }
};
