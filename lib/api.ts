import {
  TMDBTrendingResponse,
  TMDBMovieResponse,
  TMDBTVResponse,
  TMDBGenresResponse,
  TMDBSearchResponse,
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBSeasonDetail,
  TMDBEpisodeDetail,
  TMDBPerson,
  TMDBCredits,
} from "./types";

// --- MEMORY CACHE LAYER (LRU-lite) ---
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private maxSize = 100;

  set(key: string, data: any, ttlMs: number) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  getStale(key: string) {
    const item = this.cache.get(key);
    return item ? item.data : null;
  }

  clear() {
    this.cache.clear();
  }
}

const localCache = new MemoryCache();

// --- CONFIGURATION ---
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// --- CACHE STRATEGY HELPERS ---
const getCacheConfig = (url: string) => {
  // TMDB Lists (trending, popular, etc.)
  if (url.includes('/trending/') || url.includes('/popular') || url.includes('/top_rated') || url.includes('/discover')) {
    return { revalidate: 900, tags: ['tmdb:lists', 'tmdb:trending'] }; // 15 min
  }
  // TMDB Details
  if (url.match(/\/(movie|tv)\/\d+$/)) {
    const id = url.split('/').pop();
    return { revalidate: 3600, tags: [`tmdb:detail:${id}`] }; // 60 min
  }
  // TMDB Videos/Credits
  if (url.includes('/videos') || url.includes('/credits')) {
    return { revalidate: 86400, tags: ['tmdb:media'] }; // 24 hrs
  }
  // Default
  return { revalidate: 1800, tags: ['tmdb:general'] }; // 30 min
};

// Validate environment configuration
const validateEnvironment = () => {
  if (!ACCESS_TOKEN && !API_KEY) {
    throw new Error(
      "TMDB credentials not configured. Please set either TMDB_ACCESS_TOKEN or API_KEY environment variable."
    );
  }

  if (ACCESS_TOKEN && ACCESS_TOKEN.length < 10) {
    throw new Error(
      "TMDB Access Token appears to be invalid (too short). Please check your TMDB_ACCESS_TOKEN environment variable."
    );
  }

  if (API_KEY && API_KEY.length < 10) {
    throw new Error(
      "TMDB API Key appears to be invalid (too short). Please check your API_KEY environment variable."
    );
  }
};

const checkAccessToken = () => {
  validateEnvironment();
};

const getHeaders = () => ({
  ...(ACCESS_TOKEN ? { 'Authorization': `Bearer ${ACCESS_TOKEN}` } : {}),
  'Accept': 'application/json',
  'Connection': 'keep-alive',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});

// Request deduplication cache to prevent duplicate simultaneous requests
const pendingRequests = new Map<string, Promise<unknown>>();

// Simple fetch wrapper with single call and proper error handling
export async function fetchAPI<T = unknown>(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  // Modify URL to include API key if using legacy authentication
  let requestUrl = url;
  if (!ACCESS_TOKEN && API_KEY) {
    requestUrl += `${requestUrl.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  }

  // 1. IN-MEMORY CACHE (Level 1)
  if (typeof window === 'undefined') {
    const memCached = localCache.get(requestUrl);
    if (memCached) return memCached as T;
  }

  // 2. REQUEST DEDUPLICATION (Level 2)
  const cacheKey = `${requestUrl}:${JSON.stringify(options)}`;
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)! as Promise<T>;
  }

  const requestPromise = (async () => {
    let lastError: any;
    
    for (let i = 0; i <= retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const cacheConfig = getCacheConfig(requestUrl);

        const fetchOptions: RequestInit = {
          ...options,
          signal: controller.signal,
          headers: {
            ...getHeaders(),
            ...options.headers,
          },
          next: {
            revalidate: cacheConfig.revalidate,
            tags: cacheConfig.tags,
          }
        };

        const response = await fetch(requestUrl, fetchOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          const error = new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`) as Error & { 
            status: number;
            code: string;
          };
          error.status = response.status;
          
          switch (response.status) {
            case 404: error.code = 'NOT_FOUND'; break;
            case 401: error.code = 'UNAUTHORIZED'; break;
            case 429: error.code = 'RATE_LIMITED'; break;
            default: error.code = 'API_ERROR';
          }
          throw error;
        }
        
        const data = await response.json();

        // Save to memory cache for hot reuse
        if (typeof window === 'undefined') {
          localCache.set(requestUrl, data, 60000); 
        }

        return data;
      } catch (error: any) {
        lastError = error;
        const isNetworkError = error.name === 'TypeError' || error.code === 'ECONNRESET' || error.name === 'AbortError';
        
        if (isNetworkError && i < retries) {
          console.warn(`[API] Retry ${i+1}/${retries} for: ${requestUrl} - ${error.message}`);
          await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
          continue;
        }
        
        // 4. STALE-ON-ERROR FALLBACK (Level 4)
        if (typeof window === 'undefined') {
          const staleData = localCache.getStale(requestUrl);
          if (staleData) {
            console.warn(`[Cache] STALE FALLBACK on error for: ${requestUrl}`);
            return staleData as T;
          }
        }
        
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timed out after 12 seconds') as any;
          timeoutError.code = 'TIMEOUT';
          timeoutError.status = 408;
          throw timeoutError;
        }

        if (!error.status && !error.code) {
          console.error(`[API] Network error details: ${error.message}`, error);
          const networkError = new Error(`Network error or API unavailable: ${error.message}`) as any;
          networkError.status = 503;
          networkError.code = 'NETWORK_ERROR';
          throw networkError;
        }
        
        throw error;
      }
    }
    throw lastError;
  })();

  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);

  try {
    const response = await requestPromise;
    return response;
  } finally {
    // Clean up the pending request after a short delay to allow deduplication
    setTimeout(() => pendingRequests.delete(cacheKey), 1000);
  }
}

// Function overloads for getDetails
function getDetails(mediaType: "movie", id: number): Promise<TMDBMovieDetail>;
function getDetails(mediaType: "tv", id: number): Promise<TMDBTVDetail>;
function getDetails(mediaType: "movie" | "tv", id: number): Promise<TMDBMovieDetail | TMDBTVDetail>;

async function getDetails(
  mediaType: "movie" | "tv",
  id: number
): Promise<TMDBMovieDetail | TMDBTVDetail> {
  checkAccessToken();
  
  // Validate that the ID is a positive integer
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ${mediaType} ID: ${id}. ID must be a positive integer.`);
  }
  
  try {
    return await fetchAPI<TMDBMovieDetail | TMDBTVDetail>(`${BASE_URL}/${mediaType}/${id}`, {
      headers: getHeaders(),
    });
  } catch (error) {
    const error_ = error as Error & { status?: number; code?: string };
    
    // Throw a specific error for 404 not found
    if (error_.status === 404) {
      const notFoundError = new Error(`${mediaType === 'movie' ? 'Movie' : 'TV Show'} not found`) as Error & { 
        status: number; 
        code: string;
      };
      notFoundError.status = 404;
      notFoundError.code = 'NOT_FOUND';
      throw notFoundError;
    }
    
    // Re-throw other errors as-is
    throw error;
  }
}

// Get videos (trailers, clips, etc.)
function getVideos(mediaType: "movie", id: number): Promise<any>;
function getVideos(mediaType: "tv", id: number): Promise<any>;
function getVideos(mediaType: "movie" | "tv", id: number): Promise<any>;

async function getVideos(
  mediaType: "movie" | "tv",
  id: number
): Promise<any> {
  checkAccessToken();
  return await fetchAPI<any>(`${BASE_URL}/${mediaType}/${id}/videos`, {
    headers: getHeaders(),
  });
}

export const api = {
  // Trending
  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    timeWindow: "day" | "week" = "day",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/trending/${mediaType}/${timeWindow}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Popular
  async getPopular(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/${mediaType}/popular?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Top Rated
  async getTopRated(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/${mediaType}/top_rated?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Now Playing / On The Air
  async getNowPlaying(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const endpoint = mediaType === "movie" ? "now_playing" : "on_the_air";
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Upcoming / Airing Today
  async getUpcoming(
    mediaType: "movie" | "tv",
    page = 1
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    const endpoint = mediaType === "movie" ? "upcoming" : "airing_today";
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });
    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/${mediaType}/${endpoint}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Genres
  async getGenres(): Promise<TMDBGenresResponse> {
    checkAccessToken();
    return await fetchAPI<TMDBGenresResponse>(`${BASE_URL}/genre/movie/list`, {
      headers: getHeaders(),
    });
  },

  // Discover with filters
  async discover(
    mediaType: "movie" | "tv",
    params: {
      page?: number;
      genre?: string;
      sortBy?: string;
      year?: number;
      language?: string;
      minRating?: number;
      airDateGte?: string;
      airDateLte?: string;
      certificationLte?: string;
      isKids?: boolean;
    } = {}
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    
    // Default Kids restriction is PG
    const kidsCertification = params.certificationLte || 'PG';
    
    const searchParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      ...(params.genre && { with_genres: params.genre }),
      ...(params.sortBy && { sort_by: params.sortBy }),
      ...(params.year && { year: params.year.toString() }),
      ...(params.language && { with_original_language: params.language }),
      ...(params.minRating && {
        "vote_average.gte": params.minRating.toString(),
      }),
      ...(params.airDateGte && {
        "air_date.gte": params.airDateGte,
      }),
      ...(params.airDateLte && {
        "air_date.lte": params.airDateLte,
      }),
      // Enforce maturity rating for Kids
      ...(params.isKids && {
        "certification_country": "US",
        "certification.lte": kidsCertification,
      }),
    });

    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/discover/${mediaType}?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Search
  async search(
    query: string,
    mediaType?: "movie" | "tv",
    page = 1
  ): Promise<TMDBSearchResponse> {
    checkAccessToken();
    const searchParams = new URLSearchParams({
      query,
      page: page.toString(),
    });

    return await fetchAPI<TMDBSearchResponse>(`${BASE_URL}/search/multi?${searchParams}`, {
      headers: getHeaders(),
    });
  },

  // Get details with type-safe overloads
  getDetails,

  // Get season details
  async getSeasonDetails(
    seriesId: number,
    seasonNumber: number
  ): Promise<TMDBSeasonDetail> {
    checkAccessToken();
    
    // Validate that the IDs are positive integers
    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      throw new Error(`Invalid series ID: ${seriesId}. ID must be a positive integer.`);
    }
    
    if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
      throw new Error(`Invalid season number: ${seasonNumber}. Season number must be a non-negative integer.`);
    }
    
    try {
      const result = await fetchAPI<TMDBSeasonDetail>(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`, {
        headers: getHeaders(),
      });
      return result;
    } catch (error) {
      const error_ = error as Error & { status?: number };
      
      // Throw a specific error for 404 not found
      if (error_.status === 404) {
        const notFoundError = new Error(`Season ${seasonNumber} of series ${seriesId} not found`) as Error & { 
          status: number; 
          code: string;
        };
        notFoundError.status = 404;
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  },

  // Get episode details
  async getEpisodeDetails(
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<TMDBEpisodeDetail> {
    checkAccessToken();
    
    // Validate that the IDs are positive integers
    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      throw new Error(`Invalid series ID: ${seriesId}. ID must be a positive integer.`);
    }
    
    if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
      throw new Error(`Invalid season number: ${seasonNumber}. Season number must be a non-negative integer.`);
    }
    
    if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
      throw new Error(`Invalid episode number: ${episodeNumber}. Episode number must be a positive integer.`);
    }
    
    try {
      const result = await fetchAPI<TMDBEpisodeDetail>(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`, {
        headers: getHeaders(),
      });
      return result;
    } catch (error) {
      const error_ = error as Error & { status?: number };
      
      // Throw a specific error for 404 not found
      if (error_.status === 404) {
        const notFoundError = new Error(`Episode ${episodeNumber} of season ${seasonNumber} for series ${seriesId} not found`) as Error & { 
          status: number; 
          code: string;
        };
        notFoundError.status = 404;
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  },

  // Generic method to get media with category and filters
  async getMedia<T extends "movie" | "tv">(
    mediaType: T,
    options: {
      category?: "popular" | "top_rated" | "now_playing" | "upcoming" | "on_the_air" | "airing_today" | "trending";
      page?: number;
      genre?: string;
      year?: number;
      sortBy?: string;
      timeWindow?: "day" | "week";
      isKids?: boolean;
      certificationLte?: string;
    } = {}
  ): Promise<T extends "movie" ? TMDBMovieResponse : TMDBTVResponse> {
    checkAccessToken();
    
    const { 
      category = "popular", 
      page = 1, 
      genre, 
      year, 
      sortBy,
      timeWindow = "day",
      isKids = false,
      certificationLte = 'PG'
    } = options;

    // For Kids, we MUST use discover to enforce certification filters
    // Categorical endpoints (popular, trending) don't support certification filters directly
    if (isKids) {
      const kidsParams: any = {
        page,
        certificationLte,
        isKids: true,
        sortBy: sortBy || 'popularity.desc'
      };
      
      // Map category to sortBy or genre if possible
      if (category === 'top_rated') kidsParams.sortBy = 'vote_average.desc';
      if (genre) kidsParams.genre = genre;
      if (year) kidsParams.year = year;
      
      return this.discover(mediaType, kidsParams) as any;
    }

    // If we have filters (genre, year, custom sortBy), use discover API
    if (genre || year || (sortBy && sortBy !== 'popularity.desc')) {
      const params: Record<string, string> = { 
        page: page.toString(),
        sort_by: sortBy || 'popularity.desc'
      };
      if (genre) params.with_genres = genre;
      if (year) {
        if (mediaType === 'movie') {
          params.year = year.toString();
        } else {
          params.first_air_date_year = year.toString();
        }
      }
      
      const searchParams = new URLSearchParams(params);
      const data = await fetchAPI<T extends "movie" ? TMDBMovieResponse : TMDBTVResponse>(
        `${BASE_URL}/discover/${mediaType}?${searchParams}`,
        { headers: getHeaders() }
      );
      return data as T extends "movie" ? TMDBMovieResponse : TMDBTVResponse;
    }

    // Otherwise use category-specific endpoints
    let endpoint = '';
    const searchParams = new URLSearchParams({ page: page.toString() });

    switch (category) {
      case 'popular':
        endpoint = `${BASE_URL}/${mediaType}/popular`;
        break;
      case 'top_rated':
        endpoint = `${BASE_URL}/${mediaType}/top_rated`;
        break;
      case 'now_playing':
        endpoint = mediaType === 'movie' 
          ? `${BASE_URL}/movie/now_playing`
          : `${BASE_URL}/tv/on_the_air`;
        break;
      case 'upcoming':
        endpoint = mediaType === 'movie' 
          ? `${BASE_URL}/movie/upcoming`
          : `${BASE_URL}/tv/airing_today`;
        break;
      case 'on_the_air':
        endpoint = `${BASE_URL}/tv/on_the_air`;
        break;
      case 'airing_today':
        endpoint = `${BASE_URL}/tv/airing_today`;
        break;
      case 'trending':
        endpoint = `${BASE_URL}/trending/${mediaType}/${timeWindow}`;
        break;
      default:
        endpoint = `${BASE_URL}/${mediaType}/popular`;
    }

    const data = await fetchAPI<T extends "movie" ? TMDBMovieResponse : TMDBTVResponse>(
      `${endpoint}?${searchParams}`,
      { headers: getHeaders() }
    );
    return data as T extends "movie" ? TMDBMovieResponse : TMDBTVResponse;
  },

  // Get credits (cast and crew)
  async getCredits(
    mediaType: "movie" | "tv",
    id: number
  ): Promise<TMDBCredits> {
    checkAccessToken();
    return await fetchAPI<TMDBCredits>(`${BASE_URL}/${mediaType}/${id}/credits`, {
      headers: getHeaders(),
    });
  },

  // Get combined credits for person (movies and TV shows)
  async getCombinedCredits(
    mediaType: "person",
    id: number
  ): Promise<any> {
    checkAccessToken();
    return await fetchAPI<any>(`${BASE_URL}/${mediaType}/${id}/combined_credits`, {
      headers: getHeaders(),
    });
  },

  // Get person details
  async getPersonDetails(id: number): Promise<TMDBPerson> {
    checkAccessToken();
    
    // Validate that the ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`Invalid person ID: ${id}. ID must be a positive integer.`);
    }
    
    try {
      return await fetchAPI<TMDBPerson>(`${BASE_URL}/person/${id}`, {
        headers: getHeaders(),
      });
    } catch (error) {
      const error_ = error as Error & { status?: number; code?: string };
      
      // Throw a specific error for 404 not found
      if (error_.status === 404) {
        const notFoundError = new Error('Person not found') as Error & { 
          status: number; 
          code: string;
        };
        notFoundError.status = 404;
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  },

  // Get similar movies/TV shows
  async getSimilar(
    mediaType: "movie" | "tv",
    id: number,
    options: { page?: number; isKids?: boolean; certificationLte?: string } = {}
  ): Promise<TMDBTrendingResponse> {
    checkAccessToken();
    
    // If Kids profile, we should use discover with genre/certification filtering instead of a raw similar call
    // or just append certifications if the endpoint supports it (TMDB similar doesn't support them well)
    // For now, we'll try to append them but ideally we'd use discover for better filtering.
    
    const searchParams = new URLSearchParams({
      page: (options.page || 1).toString(),
    });

    if (options.isKids) {
      searchParams.append('certification_country', 'US');
      searchParams.append('certification.lte', options.certificationLte || 'PG');
    }

    return await fetchAPI<TMDBTrendingResponse>(
      `${BASE_URL}/${mediaType}/${id}/similar?${searchParams}`,
      {
        headers: getHeaders(),
      }
    );
  },

  // Get videos (trailers, clips, etc.)
  getVideos,

  // Health check utility
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    try {
      checkAccessToken();
      await fetchAPI<unknown>(`${BASE_URL}/configuration`, {
        headers: getHeaders(),
      });
      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};
