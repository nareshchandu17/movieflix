/**
 * @file services/content-engine/normalizer.ts
 * @description STEP 2: Content Normalizer for the Content Discovery Engine.
 * Normalizes disparate TMDB structures (`movie`, `tv`, `anime`) into one common `NormalizedMediaItem` contract.
 * Also attaches compatibility aliases (`name`, `release_date`, `poster_path`) for seamless rendering across existing UI cards.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NormalizedMediaItem, MediaType } from "./types";

export class ContentNormalizer {
  /**
   * Normalizes a raw media object (Movie, TV Show, or Anime) into `NormalizedMediaItem`.
   */
  public static normalize(
    rawItem: any,
    explicitType?: MediaType
  ): NormalizedMediaItem | null {
    if (!rawItem || typeof rawItem !== "object") return null;

    const id = Number(rawItem.id);
    if (isNaN(id) || id <= 0) return null;

    // Determine media type
    let mediaType: MediaType = explicitType || rawItem.media_type || "movie";
    if (rawItem.name && !rawItem.title && mediaType === "movie") {
      mediaType = "tv";
    }

    // Check if item is anime based on genre (16 = Animation) and origin language ('ja')
    const genreIds: number[] = Array.isArray(rawItem.genre_ids)
      ? rawItem.genre_ids.map(Number)
      : Array.isArray(rawItem.genres)
      ? rawItem.genres.map((g: any) => Number(g.id || g))
      : [];

    const originalLanguage = String(
      rawItem.original_language || rawItem.originalLanguage || "en"
    ).toLowerCase();

    if (
      explicitType === "anime" ||
      (genreIds.includes(16) && originalLanguage === "ja")
    ) {
      mediaType = "anime";
    }

    // Title parsing
    const title = String(
      rawItem.title || rawItem.name || rawItem.original_title || rawItem.original_name || "Untitled"
    ).trim();

    const originalTitle = String(
      rawItem.original_title || rawItem.original_name || title
    ).trim();

    // Overview parsing
    const overview = String(rawItem.overview || "").trim();

    // Artwork parsing
    const posterPath = rawItem.poster_path || rawItem.posterPath || null;
    const backdropPath = rawItem.backdrop_path || rawItem.backdropPath || null;

    // Date and year parsing
    const releaseDate = String(
      rawItem.release_date || rawItem.first_air_date || rawItem.releaseDate || ""
    ).trim();

    let releaseYear = 0;
    if (releaseDate) {
      const parsed = new Date(releaseDate);
      if (!isNaN(parsed.getTime())) {
        releaseYear = parsed.getFullYear();
      } else {
        const yearMatch = releaseDate.match(/^(\d{4})/);
        if (yearMatch) {
          releaseYear = parseInt(yearMatch[1], 10);
        }
      }
    }

    // Rating and popularity
    const voteAverage = Number(rawItem.vote_average ?? rawItem.voteAverage ?? 0);
    const voteCount = Number(rawItem.vote_count ?? rawItem.voteCount ?? 0);
    const popularity = Number(rawItem.popularity ?? 0);
    const adult = Boolean(rawItem.adult ?? false);

    const originCountry: string[] = Array.isArray(rawItem.origin_country)
      ? rawItem.origin_country.map(String)
      : Array.isArray(rawItem.originCountry)
      ? rawItem.originCountry.map(String)
      : [];

    const contentScore = Number(rawItem.contentScore ?? rawItem._curationScore ?? 0);

    const normalized: NormalizedMediaItem = {
      id,
      mediaType,
      title,
      originalTitle,
      overview,
      posterPath,
      backdropPath,
      releaseDate,
      releaseYear,
      voteAverage,
      voteCount,
      popularity,
      genreIds,
      adult,
      originCountry,
      originalLanguage,
      contentScore,
      curationReason: rawItem.curationReason,
      raw: rawItem,

      // Backwards compatibility aliases
      name: title,
      first_air_date: releaseDate,
      release_date: releaseDate,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      vote_average: voteAverage,
      vote_count: voteCount,
      genre_ids: genreIds,
      _curationScore: contentScore,
      media_type: mediaType === "anime" ? (rawItem.name ? "tv" : "movie") : mediaType,
    };

    return normalized;
  }

  /**
   * Normalizes an array of raw media items, filtering out nulls.
   */
  public static normalizePool(
    rawItems: unknown[],
    explicitType?: MediaType
  ): NormalizedMediaItem[] {
    if (!Array.isArray(rawItems)) return [];
    const pool: NormalizedMediaItem[] = [];
    const seenIds = new Set<number>();

    for (const item of rawItems) {
      const normalized = ContentNormalizer.normalize(item, explicitType);
      if (normalized && !seenIds.has(normalized.id)) {
        seenIds.add(normalized.id);
        pool.push(normalized);
      }
    }

    return pool;
  }
}
