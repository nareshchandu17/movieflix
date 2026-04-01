import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

// Types for our enhanced search system
export interface SearchResult {
  // Common properties
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  
  // Movie properties
  title?: string;
  release_date?: string;
  original_title?: string;
  video?: boolean;
  
  // TV Show properties
  name?: string;
  first_air_date?: string;
  origin_country?: string[];
  original_name?: string;
  
  // Additional properties for search enhancement
  _searchScore?: number;
  _isExactMatch?: boolean;
  _matchType?: 'exact' | 'partial' | 'fuzzy';
  _source?: 'movie' | 'tv';
}

export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
  }>;
  biography?: string;
  popularity: number;
  birthday?: string;
  place_of_birth?: string;
  _searchScore?: number;
  _isExactMatch?: boolean;
  _matchType?: 'exact' | 'partial' | 'fuzzy';
  _source?: 'person';
}

export interface SearchIntent {
  type: 'exact' | 'genre' | 'actor' | 'year' | 'general';
  confidence: number;
  detectedQuery?: string;
}

// Cache for search results
const searchCache = new Map<string, SearchResult[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// String normalization for comparison
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check for exact match
export function isExactMatch(query: string, title: string): boolean {
  const normalizedQuery = normalizeString(query);
  const normalizedTitle = normalizeString(title);
  
  return normalizedQuery === normalizedTitle ||
         normalizedTitle.includes(normalizedQuery) ||
         normalizedQuery.includes(normalizedTitle);
}

// Fuzzy matching for typo tolerance
export function fuzzyMatch(query: string, title: string): number {
  const normalizedQuery = normalizeString(query);
  const normalizedTitle = normalizeString(title);
  
  if (normalizedQuery === normalizedTitle) return 100;
  if (normalizedTitle.includes(normalizedQuery)) return 80;
  if (normalizedQuery.includes(normalizedTitle)) return 60;
  
  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(normalizedQuery, normalizedTitle);
  const maxLength = Math.max(normalizedQuery.length, normalizedTitle.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return similarity > 50 ? similarity : 0;
}

// Simple Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Detect search intent
export function detectSearchIntent(query: string): SearchIntent {
  const normalizedQuery = normalizeString(query);
  
  // Check for year patterns
  const yearMatch = normalizedQuery.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return {
      type: 'year',
      confidence: 0.9,
      detectedQuery: yearMatch[0]
    };
  }
  
  // Check for genre keywords
  const genres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy', 'animation'];
  for (const genre of genres) {
    if (normalizedQuery.includes(genre)) {
      return {
        type: 'genre',
        confidence: 0.8,
        detectedQuery: genre
      };
    }
  }
  
  // Check for actor patterns (simple heuristic)
  if (normalizedQuery.split(' ').length >= 2 && normalizedQuery.length > 6) {
    return {
      type: 'actor',
      confidence: 0.6
    };
  }
  
  // Check for exact movie/show pattern
  if (normalizedQuery.length > 3) {
    return {
      type: 'exact',
      confidence: 0.8
    };
  }
  
  return {
    type: 'general',
    confidence: 0.4
  };
}

// Calculate smart ranking score
export function calculateSearchScore(
  item: SearchResult,
  query: string,
  intent: SearchIntent
): number {
  let score = 0;
  const normalizedQuery = normalizeString(query);
  const title = item.title || item.name || '';
  const normalizedTitle = normalizeString(title);
  
  // Exact match bonus (highest priority)
  if (isExactMatch(query, title)) {
    score += 100;
    item._isExactMatch = true;
    item._matchType = 'exact';
  }
  
  // Title match score
  const titleMatchScore = fuzzyMatch(query, title);
  score += titleMatchScore * 0.5;
  if (titleMatchScore > 50 && !item._isExactMatch) {
    item._matchType = 'partial';
  }
  
  // Popularity boost
  score += Math.min(item.popularity * 0.3, 30);
  
  // Rating boost
  score += item.vote_average * 5;
  
  // Recent content boost (2023+)
  const releaseDate = item.release_date || item.first_air_date || '';
  if (releaseDate) {
    const year = new Date(releaseDate).getFullYear();
    if (year >= 2023) score += 20;
    else if (year >= 2020) score += 10;
  }
  
  // Known hits boost
  if (item.popularity > 1000) score += 30;
  else if (item.popularity > 500) score += 20;
  else if (item.popularity > 100) score += 10;
  
  // Vote count boost (indicates quality)
  if (item.vote_count > 10000) score += 15;
  else if (item.vote_count > 5000) score += 10;
  else if (item.vote_count > 1000) score += 5;
  
  // Intent-based boosts
  if (intent.type === 'exact' && item._isExactMatch) {
    score += 50; // Huge boost for exact matches
  }
  
  return score;
}

// Multi-source search with smart ranking
export async function smartSearch(
  query: string,
  options: {
    includeMovies?: boolean;
    includeTV?: boolean;
    includePeople?: boolean;
    maxResults?: number;
  } = {}
): Promise<SearchResult[]> {
  const {
    includeMovies = true,
    includeTV = true,
    includePeople = false,
    maxResults = 50
  } = options;
  
  // Check cache first
  const cacheKey = `${query}-${JSON.stringify(options)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - (cached as any)._timestamp < CACHE_DURATION) {
    return cached;
  }
  
  const intent = detectSearchIntent(query);
  const allResults: SearchResult[] = [];
  
  try {
    // Multi-source API calls
    const searchPromises: Promise<any>[] = [];
    
    if (includeMovies) {
      searchPromises.push(
        api.search(query, 'movie', 1).then(results => 
          results.results.map((item: any) => {
            // Ensure we have all required TMDBMovie properties
            return {
              id: item.id,
              title: item.title || '',
              overview: item.overview || '',
              poster_path: item.poster_path || null,
              backdrop_path: item.backdrop_path || null,
              release_date: item.release_date || '',
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              genre_ids: item.genre_ids || [],
              adult: item.adult || false,
              original_language: item.original_language || '',
              original_title: item.original_title || item.title || '',
              popularity: item.popularity || 0,
              video: item.video || false,
              // Additional properties for search enhancement
              _source: 'movie' as const,
              _searchScore: 0,
              _isExactMatch: false,
              _matchType: undefined
            };
          })
        )
      );
    }
    
    if (includeTV) {
      searchPromises.push(
        api.search(query, 'tv', 1).then(results => 
          results.results.map((item: any) => {
            // Ensure we have all required TMDBTVShow properties
            return {
              id: item.id,
              name: item.name || '',
              overview: item.overview || '',
              poster_path: item.poster_path || null,
              backdrop_path: item.backdrop_path || null,
              first_air_date: item.first_air_date || '',
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              genre_ids: item.genre_ids || [],
              adult: item.adult || false,
              origin_country: item.origin_country || [],
              original_language: item.original_language || '',
              original_name: item.original_name || item.name || '',
              popularity: item.popularity || 0,
              // Additional properties for search enhancement
              _source: 'tv' as const,
              _searchScore: 0,
              _isExactMatch: false,
              _matchType: undefined
            };
          })
        )
      );
    }
    
    const results = await Promise.allSettled(searchPromises);
    
    // Combine all results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });
    
    // Apply smart ranking
    const rankedResults = allResults
      .map(item => {
        const score = calculateSearchScore(item, query, intent);
        return { ...item, _searchScore: score };
      })
      .sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0))
      .slice(0, maxResults);
    
    // Cache results
    (rankedResults as any)._timestamp = Date.now();
    searchCache.set(cacheKey, rankedResults);
    
    return rankedResults;
    
  } catch (error) {
    console.error('Smart search failed:', error);
    return [];
  }
}

// Clear cache utility
export function clearSearchCache(): void {
  searchCache.clear();
}

// Get search suggestions
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  
  try {
    const results = await smartSearch(query, { maxResults: 10 });
    const suggestions = new Set<string>();
    
    results.slice(0, 5).forEach(item => {
      const title = item.title || item.name || '';
      if (title && fuzzyMatch(query, title) > 60) {
        suggestions.add(title);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return [];
  }
}
