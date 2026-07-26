/**
 * @file services/content-engine/strategies/anime.ts
 * @description Strategy: Anime (Japanese animation showcase: genre 16 + original language 'ja' across Movies and TV -> Merge -> Rank -> Dedupe).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchAnimeStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.discover("tv", { genre: "16", language: "ja", sortBy: "popularity.desc", page: 1, minRating: 6.8 }),
    () => TMDBService.discover("movie", { genre: "16", language: "ja", sortBy: "popularity.desc", page: 1, minRating: 6.8 }),
    () => TMDBService.discover("tv", { genre: "16", language: "ja", sortBy: "vote_average.desc", page: 1, vote_count_gte: 250 }),
    () => TMDBService.discover("movie", { genre: "16", language: "ja", sortBy: "vote_average.desc", page: 1, vote_count_gte: 200 }),
  ]);

  // Explicitly pass 'anime' mediaType so all items are tagged correctly
  const normalized = ContentNormalizer.normalizePool(rawPool, "anime");
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  const preferredGenres = new Set([16]);
  return RankingEngine.rankPool(filtered, options, trendingIds, preferredGenres);
}
