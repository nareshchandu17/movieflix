/**
 * @file services/content-engine/quality-filter.ts
 * @description STEP 3: Strict Quality Filter for the Content Discovery Engine.
 * Removes broken images, placeholder artwork, adult content, missing metadata, and low-engagement noise (`vote_average < 6.5`, `vote_count < 100`).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NormalizedMediaItem, CurationOptions } from "./types";

// Known broken or placeholder TMDB hash strings and fallback URLs that must be filtered out
const BROKEN_IMAGE_PATTERNS = [
  "null",
  "undefined",
  "wjVuAGb.png", // fallback placeholder from legacy API
  "/null",
  "/undefined",
  "placeholder",
  "no-poster",
  "default.jpg",
];

export class QualityFilter {
  /**
   * Evaluates whether a single normalized item meets our strict Netflix-grade presentation standards.
   */
  public static passes(item: NormalizedMediaItem, options: CurationOptions = {}): boolean {
    if (!item) return false;

    // 1. Check Adult Content
    if (item.adult === true) return false;

    // 2. Check Missing or Broken Poster
    if (!item.posterPath || typeof item.posterPath !== "string" || item.posterPath.trim() === "") {
      return false;
    }
    for (const pattern of BROKEN_IMAGE_PATTERNS) {
      if (item.posterPath.toLowerCase().includes(pattern)) return false;
    }

    // 3. Check Missing or Broken Backdrop
    const requireBackdrop = options.requireBackdrop !== undefined ? options.requireBackdrop : true;
    if (requireBackdrop) {
      if (!item.backdropPath || typeof item.backdropPath !== "string" || item.backdropPath.trim() === "") {
        return false;
      }
      for (const pattern of BROKEN_IMAGE_PATTERNS) {
        if (item.backdropPath.toLowerCase().includes(pattern)) return false;
      }
    }

    // 4. Check Missing or Insufficient Overview
    if (!item.overview || typeof item.overview !== "string" || item.overview.trim().length < 10) {
      return false;
    }

    // 5. Check Missing Release Date
    if (!item.releaseDate || typeof item.releaseDate !== "string" || item.releaseDate.trim() === "") {
      return false;
    }
    if (item.releaseYear <= 1900 || isNaN(item.releaseYear)) {
      return false;
    }

    // 6 & 7. Check Vote Average & Vote Count thresholds
    const minRating = options.minRating !== undefined ? options.minRating : 6.5;
    const minVoteCount = options.minVoteCount !== undefined ? options.minVoteCount : 100;

    // Allow slightly lower thresholds if an item is a brand new release (`<= 21 days old`) gaining initial traction
    const daysSinceRelease = (Date.now() - new Date(item.releaseDate).getTime()) / (1000 * 60 * 60 * 24);
    const isBrandNew = daysSinceRelease >= -7 && daysSinceRelease <= 21;

    const effectiveMinRating = isBrandNew && minRating >= 6.5 ? Math.max(6.0, minRating - 0.5) : minRating;
    const effectiveMinVotes = isBrandNew && minVoteCount >= 100 ? Math.max(25, minVoteCount / 3) : minVoteCount;

    if (item.voteAverage < effectiveMinRating) return false;
    if (item.voteCount < effectiveMinVotes) return false;

    // 8. Keyword filtering (if required by strategy)
    if (options.keywordMatch && options.keywordMatch.length > 0) {
      const combinedText = `${item.title} ${item.originalTitle} ${item.overview}`.toLowerCase();
      const hasMatch = options.keywordMatch.some((kw) =>
        combinedText.includes(kw.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    return true;
  }

  /**
   * Filters a pool of normalized items, returning only those that pass rigorous quality inspection.
   */
  public static filterPool(
    pool: NormalizedMediaItem[],
    options: CurationOptions = {}
  ): NormalizedMediaItem[] {
    if (!Array.isArray(pool)) return [];
    return pool.filter((item) => QualityFilter.passes(item, options));
  }
}
