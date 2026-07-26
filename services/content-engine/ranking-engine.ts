/**
 * @file services/content-engine/ranking-engine.ts
 * @description STEP 4: Mathematical Multi-Signal Ranking Engine (`ContentScore`).
 * Calculates an enterprise engagement score using Popularity, Vote Average, Vote Count, Recency, Genre relevance, and Trending velocity.
 * Returns best-curated content first.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NormalizedMediaItem, CurationOptions } from "./types";

export class RankingEngine {
  /**
   * Calculates composite `ContentScore` (`0` to `100+`) for a normalized media item based on multiple signals.
   * 
   * Formula breakdown (`Weights normalized to 100-point baseline`):
   * - Popularity (30%): Logarithmic or scaled cap (`max 30 points`)
   * - Vote Average (25%): `(voteAverage * 10) * 0.25` (`max 25 points`)
   * - Vote Count (15%): `log10(voteCount)` scaled (`max 15 points`)
   * - Recency (15%): Decay curve across last 10 years (`max 15 points`)
   * - Genre Relevance (10%): Match against requested affinity/genres (`max 10 points`)
   * - Trending Score (5%): Boost for daily/weekly viral acceleration (`max 5 points`)
   */
  public static calculateScore(
    item: NormalizedMediaItem,
    options: CurationOptions = {},
    trendingIds: Set<number> = new Set(),
    preferredGenres: Set<number> = new Set()
  ): number {
    if (!item) return 0;

    // 1. Popularity component (30 points max)
    // Typical TMDB popularity is `10` to `500+`. We scale `min(popularity / 8, 30)`
    const pop = Math.max(0, item.popularity || 0);
    const popularityScore = Math.min(30, (pop / 8) * (30 / 25)); // normalized ~30 max

    // 2. Vote Average component (25 points max)
    const rating = Math.max(0, Math.min(10, item.voteAverage || 0));
    const ratingScore = (rating * 10) * 0.25;

    // 3. Vote Count component (15 points max)
    // `log10(100) = 2, log10(10000) = 4, log10(1000000) = 6`
    const votes = Math.max(1, item.voteCount || 1);
    const voteCountScore = Math.min(15, Math.log10(votes) * 3);

    // 4. Recency component (15 points max)
    const currentYear = new Date().getFullYear();
    const ageInYears = Math.max(0, currentYear - item.releaseYear);
    // 15 points for current/next year, decaying down to minimum 2 points for classic catalogue
    const recencyScore = Math.max(2, 15 - ageInYears * 1.3);

    // 5. Genre Relevance component (10 points max)
    let genreScore = 5; // Default neutral baseline
    if (preferredGenres && preferredGenres.size > 0 && Array.isArray(item.genreIds)) {
      const matches = item.genreIds.filter((gid) => preferredGenres.has(gid)).length;
      if (matches > 0) {
        genreScore = Math.min(10, 5 + matches * 2.5);
      } else {
        genreScore = 2; // minor penalty if no genres match
      }
    }

    // 6. Trending Score component (5 points max)
    let trendingScore = 0;
    if (trendingIds.has(item.id)) {
      trendingScore = 5;
    } else if (pop > 150) {
      trendingScore = 3;
    }

    const totalScore =
      popularityScore +
      ratingScore +
      voteCountScore +
      recencyScore +
      genreScore +
      trendingScore;

    return Math.round(totalScore * 10) / 10;
  }

  /**
   * Ranks an array of items using `calculateScore`, updating `item.contentScore`, and sorting descending.
   */
  public static rankPool(
    pool: NormalizedMediaItem[],
    options: CurationOptions = {},
    trendingIds?: Set<number>,
    preferredGenres?: Set<number>
  ): NormalizedMediaItem[] {
    if (!Array.isArray(pool) || pool.length === 0) return [];

    const sortStrategy = options.sortStrategy || "score";

    // Compute scores
    for (const item of pool) {
      item.contentScore = RankingEngine.calculateScore(
        item,
        options,
        trendingIds,
        preferredGenres
      );
      // Synchronize back to backwards compatibility alias
      item._curationScore = item.contentScore;
    }

    // Sort according to strategy
    const sorted = [...pool].sort((a, b) => {
      if (sortStrategy === "rating") {
        return b.voteAverage - a.voteAverage || b.contentScore - a.contentScore;
      }
      if (sortStrategy === "popularity") {
        return b.popularity - a.popularity || b.contentScore - a.contentScore;
      }
      if (sortStrategy === "recency") {
        const dateA = new Date(a.releaseDate).getTime() || 0;
        const dateB = new Date(b.releaseDate).getTime() || 0;
        return dateB - dateA || b.contentScore - a.contentScore;
      }
      // Default: highest ContentScore first
      return b.contentScore - a.contentScore;
    });

    return sorted;
  }
}
