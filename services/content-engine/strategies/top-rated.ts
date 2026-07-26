/**
 * @file services/content-engine/strategies/top-rated.ts
 * @description Strategy: Top Rated (All-time highest prestige: movie/top_rated p1-2 + tv/top_rated p1-2 with vote_count >= 500 -> Merge -> Rank -> Dedupe).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchTopRatedStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.getCategory("movie", "top_rated", 1),
    () => TMDBService.getCategory("movie", "top_rated", 2),
    () => TMDBService.getCategory("tv", "top_rated", 1),
    () => TMDBService.getCategory("tv", "top_rated", 2),
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  // Ensure strict prestige standards (`voteCount >= 500` & `voteAverage >= 7.5` unless overridden)
  const filtered = QualityFilter.filterPool(normalized, {
    minRating: options.minRating ?? 7.5,
    minVoteCount: options.minVoteCount ?? 500,
    ...options,
  });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  return RankingEngine.rankPool(filtered, { ...options, sortStrategy: "rating" }, trendingIds);
}
