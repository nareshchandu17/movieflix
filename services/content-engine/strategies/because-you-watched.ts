/**
 * @file services/content-engine/strategies/because-you-watched.ts
 * @description Strategy: Because You Watched (Affinity & similar titles -> Merge -> Rank -> Dedupe).
 * Fetches similar, recommended, and keyword-aligned items for a specific watched title or high-engagement benchmark fallback.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

// Benchmark fallback titles if user has not watched anything yet
const BENCHMARK_MOVIE_ID = 27205; // Inception
const BENCHMARK_TV_ID = 66732; // Stranger Things

export async function fetchBecauseYouWatchedStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const targetId = options.lastWatchedId || BENCHMARK_MOVIE_ID;
  const targetType = options.strategy?.includes("tv") ? "tv" : "movie";

  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.getSimilar(targetType, targetId, 1),
    () => TMDBService.getSimilar(targetType === "movie" ? "tv" : "movie", targetId === BENCHMARK_MOVIE_ID ? BENCHMARK_TV_ID : targetId, 1),
    () => TMDBService.getRecommendations(targetType, targetId, 1),
    () => TMDBService.getRecommendations(targetType === "movie" ? "tv" : "movie", targetId === BENCHMARK_MOVIE_ID ? BENCHMARK_TV_ID : targetId, 1),
    // Fallback high-affinity discovery in case target returned sparse recommendations
    () => TMDBService.discover("movie", { sortBy: "popularity.desc", page: 1, minRating: 7.0 }),
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  // Exclude the target title itself from being recommended
  const filtered = QualityFilter.filterPool(normalized, {
    minRating: 6.5,
    excludeIds: [...(options.excludeIds || []), targetId],
    ...options,
  });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  return RankingEngine.rankPool(filtered, options, trendingIds);
}
