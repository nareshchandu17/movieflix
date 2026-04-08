import { TMDBMovie, TMDBTVShow } from '@/lib/types';

export interface ContentFilter {
  maturityRating: 'ALL' | 'G' | 'PG' | 'PG-13' | 'R' | 'TV-MA';
  blockedGenres: string[];
  allowedGenres: string[];
  maxRuntime?: number; // in minutes
  blockViolentContent: boolean;
  blockSexualContent: boolean;
  blockSubstanceUse: boolean;
  blockLanguage: string[];
}

export interface FilterResult {
  allowed: boolean;
  reasons: string[];
  filteredRating?: string;
}

// TMDB rating mappings
const TMDB_RATINGS = {
  'G': 'G',
  'PG': 'PG',
  'PG-13': 'PG-13',
  'R': 'R',
  'TV-Y': 'G',
  'TV-Y7': 'PG',
  'TV-G': 'G',
  'TV-PG': 'PG',
  'TV-14': 'PG-13',
  'TV-MA': 'R',
  'NC-17': 'R'
};

// Genre content warnings
const GENRE_WARNINGS = {
  'Action': { violence: true, intensity: 'medium' },
  'Adventure': { violence: false, intensity: 'low' },
  'Animation': { violence: false, intensity: 'low' },
  'Comedy': { violence: false, intensity: 'low' },
  'Crime': { violence: true, intensity: 'high' },
  'Documentary': { violence: false, intensity: 'low' },
  'Drama': { violence: false, intensity: 'low' },
  'Family': { violence: false, intensity: 'low' },
  'Fantasy': { violence: false, intensity: 'medium' },
  'Horror': { violence: true, intensity: 'high', sexual: true },
  'Mystery': { violence: false, intensity: 'medium' },
  'Romance': { sexual: true, intensity: 'low' },
  'Science Fiction': { violence: false, intensity: 'medium' },
  'TV Movie': { violence: false, intensity: 'low' },
  'Thriller': { violence: true, intensity: 'high' },
  'War': { violence: true, intensity: 'high' },
  'Western': { violence: true, intensity: 'medium' },
  'Kids': { violence: false, intensity: 'none' },
  'News': { violence: false, intensity: 'low' },
  'Reality': { violence: false, intensity: 'low' },
  'Soap': { violence: false, intensity: 'low' },
  'Talk': { violence: false, intensity: 'low' },
  'Politics': { violence: false, intensity: 'medium' }
};

/**
 * Filter content based on profile settings
 */
export function filterContent(
  content: TMDBMovie | TMDBTVShow,
  filter: ContentFilter
): FilterResult {
  const reasons: string[] = [];
  let allowed = true;

  // Check maturity rating
  const contentRating = getContentRating(content);
  if (!isRatingAllowed(contentRating, filter.maturityRating)) {
    allowed = false;
    reasons.push(`Content rating ${contentRating} exceeds profile limit ${filter.maturityRating}`);
  }

  // Check runtime (only available in detailed responses)
  const runtime = (content as any).runtime;
  if (filter.maxRuntime && runtime && runtime > filter.maxRuntime) {
    allowed = false;
    reasons.push(`Content duration ${runtime}min exceeds limit ${filter.maxRuntime}min`);
  }

  // Check genres
  const contentGenres = getGenres(content);
  
  // Blocked genres
  const blockedGenre = contentGenres.find(genre => 
    filter.blockedGenres.includes(genre)
  );
  if (blockedGenre) {
    allowed = false;
    reasons.push(`Genre "${blockedGenre}" is blocked for this profile`);
  }

  // Allowed genres (whitelist mode)
  if (filter.allowedGenres.length > 0) {
    const hasAllowedGenre = contentGenres.some(genre => 
      filter.allowedGenres.includes(genre)
    );
    if (!hasAllowedGenre) {
      allowed = false;
      reasons.push(`No allowed genres found in content`);
    }
  }

  // Check content warnings
  const genreWarnings = contentGenres.map(genre => GENRE_WARNINGS[genre]).filter(Boolean);
  
  if (filter.blockViolentContent) {
    const hasViolentContent = genreWarnings.some(warning => warning?.violence);
    if (hasViolentContent) {
      allowed = false;
      reasons.push('Violent content is blocked for this profile');
    }
  }

  if (filter.blockSexualContent) {
    const hasSexualContent = genreWarnings.some(warning => warning?.sexual);
    if (hasSexualContent) {
      allowed = false;
      reasons.push('Sexual content is blocked for this profile');
    }
  }

  // Check language
  if (filter.blockLanguage.length > 0 && content.original_language) {
    if (filter.blockLanguage.includes(content.original_language)) {
      allowed = false;
      reasons.push(`Language "${content.original_language}" is blocked for this profile`);
    }
  }

  return {
    allowed,
    reasons,
    filteredRating: contentRating
  };
}

/**
 * Get content rating from TMDB data
 */
function getContentRating(content: TMDBMovie | TMDBTVShow): string {
  // For movies, use certification/rating
  const releaseDates = (content as any).release_dates;
  if (releaseDates?.results) {
    const usRelease = releaseDates.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease?.release_dates?.[0]?.certification) {
      return TMDB_RATINGS[usRelease.release_dates[0].certification] || 'TV-MA';
    }
  }

  // For TV shows, use content rating
  const contentRatings = (content as any).content_ratings;
  if (contentRatings?.results) {
    const usRating = contentRatings.results.find((r: any) => r.iso_3166_1 === 'US');
    if (usRating?.rating) {
      return TMDB_RATINGS[usRating.rating] || 'TV-MA';
    }
  }

  // Default to TV-MA if no rating found
  return 'TV-MA';
}

/**
 * Check if rating is allowed based on profile setting
 */
function isRatingAllowed(contentRating: string, profileRating: string): boolean {
  const ratingHierarchy = {
    'ALL': 0,
    'G': 1,
    'PG': 2,
    'PG-13': 3,
    'R': 4,
    'TV-MA': 5
  };

  const contentLevel = ratingHierarchy[contentRating] || 5;
  const profileLevel = ratingHierarchy[profileRating] || 5;

  return contentLevel <= profileLevel;
}

/**
 * Extract genres from content
 */
function getGenres(content: TMDBMovie | TMDBTVShow): string[] {
  const genres = (content as any).genres;
  if (genres) {
    return genres.map((genre: any) => genre.name);
  }
  return [];
}

/**
 * Create default filter for profile type
 */
export function createDefaultFilter(profile: {
  isKids: boolean;
  maturityRating: string;
  parentalControls?: {
    enabled: boolean;
    maturityRating: string;
  };
}): ContentFilter {
  if (profile.isKids) {
    return {
      maturityRating: 'PG' as const,
      blockedGenres: ['Horror', 'Crime', 'Thriller', 'War'],
      allowedGenres: ['Animation', 'Family', 'Kids', 'Comedy'],
      maxRuntime: 120, // 2 hours max for kids
      blockViolentContent: true,
      blockSexualContent: true,
      blockSubstanceUse: true,
      blockLanguage: []
    };
  }

  const parentalRating = profile.parentalControls?.enabled 
    ? profile.parentalControls.maturityRating 
    : profile.maturityRating || 'TV-MA';

  return {
    maturityRating: parentalRating as any,
    blockedGenres: [],
    allowedGenres: [],
    blockViolentContent: false,
    blockSexualContent: false,
    blockSubstanceUse: false,
    blockLanguage: []
  };
}

/**
 * Apply content filter to an array of content
 */
export function filterContentArray(
  contentArray: (TMDBMovie | TMDBTVShow)[],
  filter: ContentFilter
): { filtered: (TMDBMovie | TMDBTVShow)[]; blocked: (TMDBMovie | TMDBTVShow)[] } {
  const filtered: (TMDBMovie | TMDBTVShow)[] = [];
  const blocked: (TMDBMovie | TMDBTVShow)[] = [];

  contentArray.forEach(content => {
    const result = filterContent(content, filter);
    if (result.allowed) {
      filtered.push(content);
    } else {
      blocked.push(content);
    }
  });

  return { filtered, blocked };
}
