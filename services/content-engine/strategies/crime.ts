/**
 * @file services/content-engine/strategies/crime.ts
 * @description Strategy: Crime & Mystery (Crime: 80, Mystery: 9648, Thriller: 53, Detective/Neo-Noir keywords -> Merge -> Rank -> Dedupe).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchCrimeStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const CRIME_MYSTERY_GENRES = "80,9648";
  const DETECTIVE_KEYWORDS = "10714|12564|6149|10291"; // Detective, Neo-Noir, Murder Investigation, Serial Killer

  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.discover("movie", { genre: CRIME_MYSTERY_GENRES, sortBy: "popularity.desc", page: 1, minRating: 6.5 }),
    () => TMDBService.discover("tv", { genre: CRIME_MYSTERY_GENRES, sortBy: "popularity.desc", page: 1, minRating: 6.5 }),
    () => TMDBService.discover("movie", { with_keywords: DETECTIVE_KEYWORDS, sortBy: "vote_average.desc", page: 1, vote_count_gte: 200 }),
    () => TMDBService.discover("tv", { with_keywords: DETECTIVE_KEYWORDS, sortBy: "popularity.desc", page: 1, vote_count_gte: 100 }),
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  const preferredGenres = new Set([80, 9648, 53]);
  return RankingEngine.rankPool(filtered, options, trendingIds, preferredGenres);
}
