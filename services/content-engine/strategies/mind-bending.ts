/**
 * @file services/content-engine/strategies/mind-bending.ts
 * @description Strategy: Mind-Bending (Sci-Fi: 878/10765, Psychological Thriller: 53/18, Time Travel: 4379, Parallel Universe: 156220 -> Merge -> Rank -> Dedupe).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";
import { NormalizedMediaItem, CurationOptions } from "../types";

export async function fetchMindBendingStrategy(
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  const SCI_FI_GENRES_MOVIE = "878";
  const SCI_FI_GENRES_TV = "10765";
  const MIND_BENDING_KEYWORDS = "4379|156220|4565|14819|310|10084"; // Time Travel, Parallel Universe, Dystopia, Cyberpunk, Artificial Intelligence, Simulation

  const rawPool = await TMDBService.fetchParallel([
    () => TMDBService.discover("movie", { genre: SCI_FI_GENRES_MOVIE, sortBy: "popularity.desc", page: 1, minRating: 6.8 }),
    () => TMDBService.discover("tv", { genre: SCI_FI_GENRES_TV, sortBy: "popularity.desc", page: 1, minRating: 6.8 }),
    () => TMDBService.discover("movie", { with_keywords: MIND_BENDING_KEYWORDS, sortBy: "vote_average.desc", page: 1, vote_count_gte: 300 }),
    () => TMDBService.discover("tv", { with_keywords: MIND_BENDING_KEYWORDS, sortBy: "popularity.desc", page: 1, vote_count_gte: 150 }),
  ]);

  const normalized = ContentNormalizer.normalizePool(rawPool);
  const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });

  const dailyTrending = await TMDBService.getTrending("all", "day", 1);
  const trendingIds = new Set<number>(
    (dailyTrending.results || []).map((item) => Number(item.id))
  );

  const preferredGenres = new Set([878, 10765, 53, 9648]);
  return RankingEngine.rankPool(filtered, options, trendingIds, preferredGenres);
}
