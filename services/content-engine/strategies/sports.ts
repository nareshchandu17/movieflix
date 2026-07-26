/**
 * @file services/content-engine/strategies/sports.ts
 * @description Strategy: Sports (Adrenaline, sports TV series, Football/Basketball/Olympics/F1 docs -> Merge -> Rank -> Dedupe).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchSportsStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const SPORTS_KEYWORDS = "6075|11870|9715|10811|5565|13031"; // Football, Basketball, Olympics, F1, Sports, Racing

  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.getSportsSeries(),
    () => TMDBService.discover("movie", { with_keywords: SPORTS_KEYWORDS, sortBy: "popularity.desc", page: 1, minRating: 6.0 }),
    () => TMDBService.discover("tv", { with_keywords: SPORTS_KEYWORDS, sortBy: "popularity.desc", page: 1, minRating: 6.0 }),
    () => TMDBService.discover("movie", { genre: "99", with_keywords: "6075|11870", sortBy: "popularity.desc", page: 1 }), // Sports Docs
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  // Slightly relax rating threshold to 6.0 for niche sports documentaries
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.0, ...options });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  return RankingEngine.rankPool(filtered, options, trendingIds);
}
