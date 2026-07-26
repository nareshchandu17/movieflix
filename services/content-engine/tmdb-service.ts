/**
 * @file services/content-engine/tmdb-service.ts
 * @description STEP 1: Pure raw TMDB Data Fetcher for the Content Discovery Engine.
 * Responsible ONLY for fetching raw TMDB data (with parallel Promise.all capabilities and multi-tier caching).
 * ZERO filtering, ZERO sorting, and ZERO ranking occur at this layer.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { api, fetchAPI } from "@/lib/api";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

export interface RawMediaResponse {
  results: (TMDBMovie | TMDBTVShow)[];
  page: number;
  total_pages: number;
  total_results: number;
}

export class TMDBService {
  /**
   * Fetch trending media across all or specific types (`movie`, `tv`, `all`) for a given time window (`day`, `week`).
   */
  public static async getTrending(
    type: "all" | "movie" | "tv" = "all",
    window: "day" | "week" = "day",
    page: number = 1
  ): Promise<RawMediaResponse> {
    const res = await api.getTrending(type, window, page);
    return {
      results: Array.isArray(res.results) ? res.results : [],
      page: res.page || page,
      total_pages: res.total_pages || 1,
      total_results: res.total_results || 0,
    };
  }

  /**
   * Fetch standard media categories (`popular`, `top_rated`, `now_playing`, `upcoming`, `airing_today`).
   */
  public static async getCategory(
    type: "movie" | "tv",
    category: "popular" | "top_rated" | "now_playing" | "upcoming" | "airing_today" | "on_the_air",
    page: number = 1
  ): Promise<RawMediaResponse> {
    const res = await api.getMedia(type, { category: category as any, page });
    return {
      results: Array.isArray(res.results) ? res.results : [],
      page: res.page || page,
      total_pages: res.total_pages || 1,
      total_results: res.total_results || 0,
    };
  }

  /**
   * Discover media by genres, keywords, release dates, or origin language.
   */
  public static async discover(
    type: "movie" | "tv",
    options: {
      genre?: string;
      sortBy?: string;
      page?: number;
      minRating?: number;
      airDateGte?: string;
      language?: string;
      with_keywords?: string;
      with_runtime_lte?: number;
      vote_count_gte?: number;
      vote_count_lte?: number;
    } = {}
  ): Promise<RawMediaResponse> {
    const res = await api.discover(type, {
      genre: options.genre,
      sortBy: options.sortBy,
      page: options.page || 1,
      minRating: options.minRating,
      airDateGte: options.airDateGte,
      language: options.language,
      with_keywords: options.with_keywords,
      "vote_count.gte": options.vote_count_gte,
      "vote_count.lte": options.vote_count_lte,
    } as any);

    return {
      results: Array.isArray(res.results) ? res.results : [],
      page: res.page || options.page || 1,
      total_pages: res.total_pages || 1,
      total_results: res.total_results || 0,
    };
  }

  /**
   * Fetch similar titles for a specific movie or tv show.
   */
  public static async getSimilar(
    type: "movie" | "tv",
    id: number,
    page: number = 1
  ): Promise<RawMediaResponse> {
    const res = await api.getSimilar(type, id, { page });
    return {
      results: Array.isArray(res?.results) ? res.results : [],
      page: res?.page || page,
      total_pages: res?.total_pages || 1,
      total_results: res?.total_results || 0,
    };
  }

  /**
   * Fetch recommended titles for a specific movie or tv show.
   */
  public static async getRecommendations(
    type: "movie" | "tv",
    id: number,
    page: number = 1
  ): Promise<RawMediaResponse> {
    const res: any = await fetchAPI(
      `https://api.themoviedb.org/3/${type}/${id}/recommendations?page=${page}`
    );
    return {
      results: Array.isArray(res?.results) ? res.results : [],
      page: res?.page || page,
      total_pages: res?.total_pages || 1,
      total_results: res?.total_results || 0,
    };
  }

  /**
   * Fetch multiple TMDB endpoints in parallel using Promise.all.
   * Guarantees zero sequential bottlenecking across complex multi-source strategies.
   */
  public static async fetchParallel(
    tasks: Array<() => Promise<RawMediaResponse | (TMDBMovie | TMDBTVShow)[]>>,
    concurrencyLimit: number = 5
  ): Promise<(TMDBMovie | TMDBTVShow)[]> {
    const results: any[] = [];
    
    // Process in chunks to prevent Node.js socket exhaustion (ECONNRESET)
    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      const chunk = tasks.slice(i, i + concurrencyLimit);
      // Remove the .catch() here so errors propagate and fail the strategy fetch if TMDB 429 occurs
      const chunkResults = await Promise.all(chunk.map((t) => t()));
      results.push(...chunkResults);
      
      // Small delay between chunks to be safe with TMDB rate limits
      if (i + concurrencyLimit < tasks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const combinedPool: (TMDBMovie | TMDBTVShow)[] = [];

    for (const res of results) {
      if (Array.isArray(res)) {
        combinedPool.push(...res);
      } else if (res && Array.isArray(res.results)) {
        combinedPool.push(...res.results);
      }
    }

    return combinedPool;
  }

  /**
   * Fetch specialized sports & fitness series from our curated API service.
   */
  public static async getSportsSeries(): Promise<TMDBTVShow[]> {
    const res = await api.getSportsAndFitnessSeries();
    return Array.isArray(res) ? res : [];
  }

  /**
   * Fetch details for specific list of IDs in parallel (e.g. for hero or manual curation).
   */
  public static async getDetailsBatch(
    type: "movie" | "tv",
    ids: number[]
  ): Promise<any[]> {
    try {
      const results = await Promise.all(
        ids.map((id) => api.getDetails(type, id).catch(() => null))
      );
      return results.filter((item) => item !== null);
    } catch (e) {
      console.error(`[TMDBService] getDetailsBatch error (${type}):`, e);
      return [];
    }
  }
}
