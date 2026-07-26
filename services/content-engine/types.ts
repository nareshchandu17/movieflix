/**
 * @file services/content-engine/types.ts
 * @description Core interfaces and type definitions for the MovieFlix Content Discovery & Recommendation Engine.
 * Provides normalized structures across Movies, TV Series, and Anime, along with allocation request contracts.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBMovie, TMDBTVShow } from "@/lib/types";

export type MediaType = "movie" | "tv" | "anime";

export type StrategyName =
  | "trending"
  | "recommended"
  | "because-you-watched"
  | "sports"
  | "crime"
  | "mind-bending"
  | "top-rated"
  | "anime"
  | "new-releases"
  | "action-adventure"
  | "weekend-binge"
  | "hidden-gems"
  | "time-based"
  | string;

/**
 * Universal Normalized Media Item interface across all carousels and pages.
 * Includes both clean camelCase tokens for new components and snake_case aliases for backwards compatibility with existing UI cards (`MediaCard`, `EnhancedMediaCard`).
 */
export interface NormalizedMediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  releaseYear: number;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  adult: boolean;
  originCountry: string[];
  originalLanguage: string;
  contentScore: number;
  curationReason?: string;
  raw?: TMDBMovie | TMDBTVShow | any;

  // Backwards compatibility aliases for existing UI components
  name?: string;
  first_air_date?: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  _curationScore?: number;
  media_type?: "movie" | "tv";
}

export interface CurationOptions {
  limit?: number;
  minRating?: number;
  minVoteCount?: number;
  requireBackdrop?: boolean;
  applyGlobalDeduplication?: boolean;
  keywordMatch?: string[];
  excludeIds?: number[];
  page?: number;
  strategy?: StrategyName;
  pageKey?: string;
  userId?: string;
  lastWatchedId?: number;
  sortStrategy?: "score" | "rating" | "popularity" | "recency";
}

export interface AllocationRequest {
  strategy: StrategyName;
  limit?: number;
  page?: number;
  pageKey?: string; // e.g. "home", "movies", "series", "new-popular"
  options?: CurationOptions;
}

export interface AllocationResponse {
  strategy: StrategyName;
  page: number;
  limit: number;
  totalAvailable: number;
  items: NormalizedMediaItem[];
}
