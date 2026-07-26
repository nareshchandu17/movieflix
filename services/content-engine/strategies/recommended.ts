/**
 * @file services/content-engine/strategies/recommended.ts
 * @description Strategy: Recommended (Watch history / Favorite genres + Trending + Top Rated -> Merge -> Rank -> Dedupe).
 * Provides algorithmic recommendations tailored to user preferences or high-engagement defaults.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchRecommendedStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const preferredGenreIds = new Set<number>();
  
  // If user watch history or explicit genre preferences are passed in options
  // we discover candidates matching those genres alongside high-momentum trending items
  const tasks: Array<() => Promise<any>> = [
    () => TMDBService.getTrending("all", "day", 1),
    () => TMDBService.getCategory("movie", "top_rated", 1),
    () => TMDBService.getCategory("tv", "top_rated", 1),
  ];

  // If specific last watched ID or genre exclusion/inclusion exists, query discovery or recommendations
  if (options.lastWatchedId) {
    tasks.push(() => TMDBService.getRecommendations("movie", options.lastWatchedId!, 1));
    tasks.push(() => TMDBService.getRecommendations("tv", options.lastWatchedId!, 1));
  } else {
    // Default discovery boost across high-affinity categories (Action=28, Sci-Fi=878, Drama=18)
    tasks.push(() => TMDBService.discover("movie", { sortBy: "popularity.desc", page: 1, minRating: 7.0 }));
    tasks.push(() => TMDBService.discover("tv", { sortBy: "popularity.desc", page: 1, minRating: 7.0 }));
  }

  const rawPool = await TMDBService.fetchParallel(tasks);
  const normalized = ContentNormalizer.normalizePool(rawPool);
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });

  // Gather trending IDs for viral velocity boost
  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  return RankingEngine.rankPool(filtered, options, trendingIds, preferredGenreIds);
}
