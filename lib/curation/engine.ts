/**
 * @file engine.ts
 * @description Core OTT Content Curation Engine & Global Deduplication Manager for MovieFlix.
 * Implements rigorous quality filters, mathematical engagement scoring, and session-wide deduplication.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBMovie, TMDBTVShow } from "../types";

export type MediaItem = (TMDBMovie | TMDBTVShow) & {
  media_type?: "movie" | "tv";
  _curationScore?: number;
};

export interface CurationOptions {
  limit?: number;
  minRating?: number;
  minVoteCount?: number;
  requireBackdrop?: boolean;
  applyGlobalDeduplication?: boolean;
  sortStrategy?: "score" | "rating" | "popularity" | "recency";
  keywordMatch?: string[];
}

/**
 * Global Deduplication Registry across the entire homepage session (`/`).
 * Ensures no TMDB ID is ever rendered in more than one carousel simultaneously.
 */
class GlobalDeduplicationRegistry {
  private claimedIds: Set<number> = new Set();

  /**
   * Resets the deduplication registry. Typically called when unmounting or re-mounting the root homepage.
   */
  public reset(): void {
    this.claimedIds.clear();
  }

  /**
   * Checks if an item ID has already been claimed/displayed by any previous carousel.
   */
  public isClaimed(id: number): boolean {
    return this.claimedIds.has(id);
  }

  /**
   * Manually registers IDs (e.g. Hero slides or top cards) so downstream carousels skip them.
   */
  public claimIds(ids: number[]): void {
    ids.forEach((id) => {
      if (id && !isNaN(id)) {
        this.claimedIds.add(id);
      }
    });
  }

  /**
   * Filters an array of candidate items, removing any that have already been displayed globally.
   * Claims up to `limit` unique items and returns them.
   */
  public claimAndFilter<T extends { id: number }>(items: T[], limit: number = 20): T[] {
    const uniqueResults: T[] = [];

    for (const item of items) {
      if (uniqueResults.length >= limit) break;
      if (!item.id || isNaN(item.id)) continue;

      if (!this.claimedIds.has(item.id)) {
        this.claimedIds.add(item.id);
        uniqueResults.push(item);
      }
    }

    return uniqueResults;
  }

  /**
   * Returns total count of claimed IDs across all carousels.
   */
  public getClaimedCount(): number {
    return this.claimedIds.size;
  }
}

export const GlobalDeduplicationManager = new GlobalDeduplicationRegistry();

/**
 * Checks if a TMDB media item passes the strict quality criteria:
 * - Valid poster and backdrop artwork
 * - Valid overview text (>= 10 characters)
 * - Valid release date
 * - Minimum vote_average >= 6.5 (or custom threshold)
 * - Minimum vote_count >= 100 (or custom threshold)
 * - No adult content
 */
export function passesQualityFilter(item: MediaItem, options: CurationOptions = {}): boolean {
  if (!item || typeof item !== "object") return false;
  if (item.adult === true) return false;

  const minRating = options.minRating !== undefined ? options.minRating : 6.5;
  const minVoteCount = options.minVoteCount !== undefined ? options.minVoteCount : 100;
  const requireBackdrop = options.requireBackdrop !== undefined ? options.requireBackdrop : true;

  // Check artwork
  if (!item.poster_path || item.poster_path.trim() === "") return false;
  if (requireBackdrop && (!item.backdrop_path || item.backdrop_path.trim() === "")) return false;

  // Check overview
  if (!item.overview || item.overview.trim().length < 10) return false;

  // Check release date
  const releaseDate = (item as any).release_date || (item as any).first_air_date;
  if (!releaseDate || typeof releaseDate !== "string" || releaseDate.trim() === "") return false;

  // Check rating & vote counts
  const voteAverage = item.vote_average !== undefined ? item.vote_average : 0;
  const voteCount = item.vote_count !== undefined ? item.vote_count : 0;

  if (voteAverage < minRating) return false;
  if (voteCount < minVoteCount) return false;

  // Check optional keyword matching if provided
  if (options.keywordMatch && options.keywordMatch.length > 0) {
    const combinedText = `${(item as any).title || (item as any).name || ""} ${item.overview}`.toLowerCase();
    const hasMatch = options.keywordMatch.some((kw) => combinedText.includes(kw.toLowerCase()));
    if (!hasMatch) return false;
  }

  return true;
}

/**
 * Mathematical Scoring Engine:
 * score = (popularity × 0.35) + (vote_average × 0.30) + (log(vote_count) × 0.20) + (recency × 0.15)
 * 
 * Note: Since vote_average is 0-10 and popularity varies widely (`~50 to 500+`),
 * we normalize components proportionally so each factor carries its intended percentage weight.
 */
export function calculateScore(item: MediaItem): number {
  const popularity = Math.max(0, item.popularity || 0);
  const popularityScore = popularity * 0.35;

  // Normalize vote_average (`0-10`) to 100-point scale
  const voteAverage = Math.max(0, item.vote_average || 0);
  const ratingScore = (voteAverage * 10) * 0.30;

  // Logarithmic vote count scale (`log(100) ~ 4.6, log(10,000) ~ 9.2`) scaled to `~100`
  const voteCount = Math.max(1, item.vote_count || 1);
  const voteCountScore = (Math.log(voteCount) * 10) * 0.20;

  // Recency score (0 to 100 scale based on release year within last 10 years)
  const releaseDate = (item as any).release_date || (item as any).first_air_date || "";
  let recencyScore = 50; // Default fallback if date parsing fails
  if (releaseDate) {
    const releaseYear = new Date(releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const ageInYears = Math.max(0, currentYear - releaseYear);
    // 100 points for this year, decaying by 8 points per year down to minimum 10
    recencyScore = Math.max(10, 100 - ageInYears * 8) * 0.15;
  } else {
    recencyScore = 50 * 0.15;
  }

  return popularityScore + ratingScore + voteCountScore + recencyScore;
}

/**
 * Master pool curation function. Takes an array of raw candidates from multiple TMDB endpoints,
 * deduplicates internally, applies quality filters, calculates curation scores, sorts, and applies global deduplication.
 */
export function curateMediaPool<T extends MediaItem>(
  rawPool: T[],
  options: CurationOptions = {}
): T[] {
  if (!Array.isArray(rawPool) || rawPool.length === 0) return [];

  const limit = options.limit !== undefined ? options.limit : 20;
  const applyGlobalDeduplication = options.applyGlobalDeduplication !== undefined ? options.applyGlobalDeduplication : true;
  const sortStrategy = options.sortStrategy || "score";

  // Step 1: Internal deduplication by item ID
  const uniqueByIdMap = new Map<number, T>();
  for (const item of rawPool) {
    if (item && item.id && !uniqueByIdMap.has(item.id)) {
      uniqueByIdMap.set(item.id, item);
    }
  }

  // Step 2: Quality filtering
  const validCandidates: T[] = [];
  for (const item of uniqueByIdMap.values()) {
    if (passesQualityFilter(item, options)) {
      item._curationScore = calculateScore(item);
      validCandidates.push(item);
    }
  }

  // Step 3: Sorting based on strategy
  validCandidates.sort((a, b) => {
    if (sortStrategy === "rating") {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    if (sortStrategy === "popularity") {
      return (b.popularity || 0) - (a.popularity || 0);
    }
    if (sortStrategy === "recency") {
      const dateA = new Date((a as any).release_date || (a as any).first_air_date || 0).getTime();
      const dateB = new Date((b as any).release_date || (b as any).first_air_date || 0).getTime();
      return dateB - dateA;
    }
    // Default: descending curation score
    return (b._curationScore || 0) - (a._curationScore || 0);
  });

  // Step 4: Global Deduplication slicing
  if (applyGlobalDeduplication) {
    return GlobalDeduplicationManager.claimAndFilter(validCandidates, limit);
  }

  return validCandidates.slice(0, limit);
}
