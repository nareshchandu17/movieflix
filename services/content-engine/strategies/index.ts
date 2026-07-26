/**
 * @file services/content-engine/strategies/index.ts
 * @description Strategy Registry & Dynamic Dispatcher for the Content Discovery Engine.
 * Routes incoming strategy names to their corresponding parallel fetch & ranking pipelines.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { StrategyName, NormalizedMediaItem, CurationOptions } from "../types";
import { fetchTrendingStrategy } from "./trending";
import { fetchRecommendedStrategy } from "./recommended";
import { fetchBecauseYouWatchedStrategy } from "./because-you-watched";
import { fetchSportsStrategy } from "./sports";
import { fetchCrimeStrategy } from "./crime";
import { fetchMindBendingStrategy } from "./mind-bending";
import { fetchTopRatedStrategy } from "./top-rated";
import { fetchAnimeStrategy } from "./anime";
import { TMDBService } from "../tmdb-service";
import { ContentNormalizer } from "../normalizer";
import { QualityFilter } from "../quality-filter";
import { RankingEngine } from "../ranking-engine";

/**
 * Dispatcher function: Executes the matching strategy fetcher, or falls back to a universal discovery query.
 */
export async function fetchStrategyPool(
  strategy: StrategyName,
  options: CurationOptions = {}
): Promise<NormalizedMediaItem[]> {
  switch (strategy) {
    case "trending":
      return fetchTrendingStrategy(options);
    case "recommended":
      return fetchRecommendedStrategy(options);
    case "because-you-watched":
      return fetchBecauseYouWatchedStrategy(options);
    case "sports":
    case "sports-fitness":
      return fetchSportsStrategy(options);
    case "crime":
    case "crime-mystery":
      return fetchCrimeStrategy(options);
    case "mind-bending":
      return fetchMindBendingStrategy(options);
    case "top-rated":
      return fetchTopRatedStrategy(options);
    case "anime":
      return fetchAnimeStrategy(options);
    case "action-adventure":
    case "action": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { genre: "28,12", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.5 }),
        () => TMDBService.discover("tv", { genre: "10759", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.5 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "weekend-binge": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("tv", { sortBy: "popularity.desc", page: options.page || 1, vote_count_gte: 300, minRating: 7.0 }),
        () => TMDBService.discover("tv", { sortBy: "vote_average.desc", page: options.page || 1, vote_count_gte: 500 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 7.0, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "new-releases": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.getCategory("movie", "now_playing", options.page || 1),
        () => TMDBService.getCategory("tv", "on_the_air", options.page || 1),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.0, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "hidden-gems": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { sortBy: "vote_average.desc", page: options.page || 1, vote_count_gte: 100, vote_count_lte: 1500, minRating: 7.5 }),
        () => TMDBService.discover("tv", { sortBy: "vote_average.desc", page: options.page || 1, vote_count_gte: 100, vote_count_lte: 1500, minRating: 7.5 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 7.5, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "time-based": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.getTrending("all", "day", options.page || 1),
        () => TMDBService.getCategory("movie", "popular", options.page || 1),
        () => TMDBService.getCategory("tv", "popular", options.page || 1),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "top10-india": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { language: "hi", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.0 }),
        () => TMDBService.discover("movie", { language: "te", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.0 }),
        () => TMDBService.discover("tv", { language: "hi", sortBy: "popularity.desc", page: options.page || 1 }),
        () => TMDBService.discover("tv", { language: "te", sortBy: "popularity.desc", page: options.page || 1 }),
        () => TMDBService.discover("tv", { language: "ta", sortBy: "popularity.desc", page: options.page || 1 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.0, minVoteCount: 10, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "award-winners": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { sortBy: "vote_average.desc", page: options.page || 1, vote_count_gte: 1500, minRating: 7.8 }),
        () => TMDBService.discover("tv", { sortBy: "vote_average.desc", page: options.page || 1, vote_count_gte: 1000, minRating: 7.8 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 7.8, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "creepy-disturbing": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { genre: "27,53", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.2 }),
        () => TMDBService.discover("tv", { genre: "9648,10765", with_keywords: "12339|10291|12377", sortBy: "popularity.desc", page: options.page || 1, minRating: 6.2 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.2, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    case "around-the-world": {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.discover("movie", { sortBy: "popularity.desc", page: (options.page || 1) + 1, minRating: 7.0 }),
        () => TMDBService.discover("tv", { sortBy: "popularity.desc", page: (options.page || 1) + 1, minRating: 7.0 }),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 7.0, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
    default: {
      const rawPool = await TMDBService.fetchParallel([
        () => TMDBService.getCategory("movie", "popular", options.page || 1),
        () => TMDBService.getCategory("tv", "popular", options.page || 1),
      ]);
      const normalized = ContentNormalizer.normalizePool(rawPool);
      const filtered = QualityFilter.filterPool(normalized, { minRating: 6.5, ...options });
      return RankingEngine.rankPool(filtered, options);
    }
  }
}

export {
  fetchTrendingStrategy,
  fetchRecommendedStrategy,
  fetchBecauseYouWatchedStrategy,
  fetchSportsStrategy,
  fetchCrimeStrategy,
  fetchMindBendingStrategy,
  fetchTopRatedStrategy,
  fetchAnimeStrategy,
};
