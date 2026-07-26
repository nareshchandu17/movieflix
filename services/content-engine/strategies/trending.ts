/**
 * @file services/content-engine/strategies/trending.ts
 * @description Strategy: Trending (Trending Today, Trending Week, Popular -> Merge -> Rank -> Dedupe).
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchTrendingStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.getTrending("all", "day", 1),
    () => TMDBService.getTrending("all", "week", 1),
    () => TMDBService.getCategory("movie", "popular", 1),
    () => TMDBService.getCategory("tv", "popular", 1),
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });
  
  // Track daily trending IDs for viral velocity boost in ranking engine
  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  return RankingEngine.rankPool(filtered, options, trendingIds);
}
