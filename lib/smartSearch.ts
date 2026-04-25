/**
 * MovieFlix Keyword Search (Core)
 * Implementation based on Production Spec
 * Optimized for broad queries and infrastructure stability.
 */

export enum QueryType {
  KEYWORD = "KEYWORD",
}

export interface SearchResult {
  id: number | string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  media_type?: string;
  _source?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  _searchScore?: number;
  _isExactMatch?: boolean;
  _matchType?: 'exact' | 'partial' | 'similar';
}

export interface SearchResponse {
  topMatch: SearchResult | null;
  actor?: {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
    biography?: string;
  } | null;
  movies: SearchResult[];
  tv: SearchResult[];
  people: SearchResult[];
  results: SearchResult[];
  suggestions?: string[];
  empty?: boolean;
}

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "9abb949e34b5c04e7f1b0ad95ece7212";

/**
 * Robust Fetch with Retry and Timeout
 */
async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4s timeout per request

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) return { results: [] };
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      if (i === retries) return { results: [] };
      await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
    }
  }
}

/**
 * Normalize Query
 */
export function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Global Filters
 */
function isValid(item: any): boolean {
  if (item.media_type === "person") {
    return !!item.profile_path && (item.popularity ?? 0) > 1;
  }

  const hasPoster = !!item.poster_path;
  const hasDate = !!(item.release_date || item.first_air_date);
  const votesOk = (item.vote_count ?? 0) >= 50;

  return hasPoster && hasDate && votesOk;
}

/**
 * Person-Specific Movie Ranking
 */
function scorePersonMovie(m: any): number {
  const rating = (m.vote_average ?? 0) * 3;        // 0–30
  const popularity = Math.log10((m.popularity ?? 1) + 1) * 10; // 0–20
  const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : 0;
  const recency = releaseYear >= 2015 ? 10 : (releaseYear >= 2000 ? 5 : 0);

  // Boost if it's a primary role (cast position < 5)
  const roleBoost = (m.order !== undefined && m.order < 5) ? 15 : 0;
  const highVoteBoost = (m.vote_count ?? 0) > 1000 ? 10 : 0;

  return rating + popularity + recency + roleBoost + highVoteBoost;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function getFuzzyScore(title: string, query: string): number {
  const dist = getLevenshteinDistance(title, query);
  const maxLen = Math.max(title.length, query.length);
  if (maxLen === 0) return 0;
  const similarity = 1 - dist / maxLen;
  return similarity > 0.7 ? similarity * 80 : 0; // Increased multiplier for typo recovery
}

/**
 * Ranking Logic
 */
function scoreItem(item: any, query: string, detectedGenreId?: number | null): number {
  const title = (item.title || item.name || "").toLowerCase();

  let exact = 0;
  let prefix = 0;
  let partial = 0;
  let fuzzy = 0;

  if (title === query) exact = 100;
  else if (title.startsWith(query)) prefix = 60;
  else if (title.includes(query)) partial = 30;
  else fuzzy = getFuzzyScore(title, query);

  const rating = (item.vote_average ?? 0) * 3; 
  const popularity = Math.log10((item.popularity ?? 1) + 1) * 10;

  // Genre match boost
  let genreBoost = 0;
  if (detectedGenreId && item.genre_ids?.includes(detectedGenreId)) {
    genreBoost = 40;
  }

  return exact + prefix + partial + fuzzy + rating + popularity + genreBoost;
}

/**
 * Metadata Mappings for Intelligent Intent Discovery
 */
const COLLECTION_MAP: Record<string, { keywords?: string, genres?: string, company?: string }> = {
  oscar: { keywords: "310|10738" },
  winners: { keywords: "310|10738" },
  marvel: { company: "420" },
  dc: { company: "9993|128064" },
  disney: { company: "2" },
  pixar: { company: "3" },
  netflix: { company: "213" },
  thrillers: { genres: "53" },
  classics: { keywords: "156030" },
  blockbusters: { keywords: "1701" }
};
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  science: 878,
  thriller: 53,
  war: 10752,
  western: 37,
  kids: 10762,
  reality: 10764,
  news: 10763
};

const MEDIA_TYPE_MAP: Record<string, "movie" | "tv"> = {
  movie: "movie",
  movies: "movie",
  film: "movie",
  films: "movie",
  cinema: "movie",
  tv: "tv",
  series: "tv",
  shows: "tv",
  show: "tv",
  season: "tv"
};

/**
 * Main Search Logic - 3-Page Fetch Depth
 */
export async function smartSearch(
  query: string
): Promise<SearchResponse> {
  const q = normalizeQuery(query);
  const words = q.split(" ");
  const emptyResponse: SearchResponse = { topMatch: null, movies: [], tv: [], people: [], results: [] };

  if (q.length === 0) return emptyResponse;

  // 🔍 Intent Detection: Genre + Media Type + Collections
  let detectedGenreId: number | null = null;
  let detectedMediaType: "movie" | "tv" | null = null;
  let collectionFilters: { keywords?: string, genres?: string, company?: string } = {};

  for (const word of words) {
    if (GENRE_MAP[word]) detectedGenreId = GENRE_MAP[word];
    if (MEDIA_TYPE_MAP[word]) detectedMediaType = MEDIA_TYPE_MAP[word];
    if (COLLECTION_MAP[word]) {
      collectionFilters = { ...collectionFilters, ...COLLECTION_MAP[word] };
    }
  }

  try {
    // ⚙️ API Strategy - Increased depth to 3 pages for movie search to find blockbusters
    const endpoints = [
      `${TMDB_BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1&include_adult=false`,
      `${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1&include_adult=false`,
      `${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=2&include_adult=false`,
      `${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=3&include_adult=false`,
      `${TMDB_BASE}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1&include_adult=false`
    ];

    // Add Discovery call for Genre Intent
    if (detectedGenreId) {
      const type = detectedMediaType || "movie";
      endpoints.push(`${TMDB_BASE}/discover/${type}?api_key=${API_KEY}&with_genres=${detectedGenreId}&sort_by=popularity.desc&vote_count.gte=100&page=1`);
    }

    // Add Discovery call for Collection Intent (Marvel, Oscars, etc.)
    const hasCollectionIntent = Object.keys(collectionFilters).length > 0;
    if (hasCollectionIntent) {
      const type = detectedMediaType || "movie";
      const params = new URLSearchParams({
        api_key: API_KEY,
        sort_by: "popularity.desc",
        "vote_count.gte": "100",
        page: "1",
        ...(collectionFilters.keywords && { with_keywords: collectionFilters.keywords }),
        ...(collectionFilters.genres && { with_genres: collectionFilters.genres }),
        ...(collectionFilters.company && { with_companies: collectionFilters.company })
      });
      endpoints.push(`${TMDB_BASE}/discover/${type}?${params.toString()}`);
    }

    const dataList = await Promise.all(endpoints.map(url => fetchWithRetry(url)));

    const multiResults = dataList[0]?.results || [];
    const movieResults = [
      ...(dataList[1]?.results || []),
      ...(dataList[2]?.results || []),
      ...(dataList[3]?.results || [])
    ].map((m: any) => ({ ...m, media_type: 'movie' }));
    const tvResults = (dataList[4]?.results || []).map((t: any) => ({ ...t, media_type: 'tv' }));
    
    // Process discovery results (index 5 for genre, index 6 for collection)
    let discoveryResults: any[] = [];
    
    const genreDiscovery = detectedGenreId ? (dataList[5]?.results || []) : [];
    const collectionIndex = detectedGenreId ? 6 : 5;
    const collectionDiscovery = hasCollectionIntent ? (dataList[collectionIndex]?.results || []) : [];

    discoveryResults = [...genreDiscovery, ...collectionDiscovery].map((i: any) => ({
      ...i,
      media_type: detectedMediaType || i.media_type || "movie",
      _searchScore: (i.vote_average || 0) * 5 + 55 // Premium discovery score
    }));

    let rawItems = [...multiResults, ...movieResults, ...tvResults, ...discoveryResults];
    console.log(`[smartSearch] Initial results for "${q}": ${rawItems.length}`);

    // 🩹 Option B — Typo Recovery: Progressive Prefix-Truncation + Fuzzy Best-Pick
    if (rawItems.length === 0 && q.length >= 4) {
      console.log(`[smartSearch] No results for "${q}". Running Option B prefix-truncation...`);

      // Build prefix lengths to try: full-1, 60%, 50% of query length (min 4 chars)
      const prefixLengths = [
        q.length - 1,
        Math.max(4, Math.floor(q.length * 0.7)),
        Math.max(4, Math.floor(q.length * 0.55))
      ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

      // Run parallel prefix searches
      const prefixSearches = await Promise.all(
        prefixLengths.map(len => {
          const prefix = q.substring(0, len);
          return fetchWithRetry(
            `${TMDB_BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(prefix)}&page=1&include_adult=false`
          );
        })
      );

      // Collect all candidate titles from prefix results
      const candidates: string[] = [];
      prefixSearches.forEach(data => {
        (data?.results || []).forEach((item: any) => {
          const title = item.title || item.name;
          if (title && !candidates.includes(title)) candidates.push(title);
        });
      });

      console.log(`[smartSearch] Option B candidates (${candidates.length}):`, candidates.slice(0, 5));

      if (candidates.length > 0) {
        // Pick best candidate by fuzzy score against original typo
        const bestMatch = candidates.reduce((best, current) => {
          const cs = getFuzzyScore(current.toLowerCase(), q);
          const bs = getFuzzyScore(best.toLowerCase(), q);
          return cs > bs ? current : best;
        }, candidates[0]);

        const bestScore = getFuzzyScore(bestMatch.toLowerCase(), q);
        console.log(`[smartSearch] Best fuzzy match: "${bestMatch}" (score: ${bestScore.toFixed(1)})`);

        // Only use if similarity is meaningful (score > 20)
        if (bestScore > 20) {
          const fallbackData = await Promise.all([
            fetchWithRetry(`${TMDB_BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(bestMatch)}&page=1&include_adult=false`),
            fetchWithRetry(`${TMDB_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(bestMatch)}&page=1&include_adult=false`),
            fetchWithRetry(`${TMDB_BASE}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(bestMatch)}&page=1&include_adult=false`)
          ]);
          rawItems = [
            ...(fallbackData[0]?.results || []),
            ...(fallbackData[1]?.results || []).map((i: any) => ({ ...i, media_type: 'movie' })),
            ...(fallbackData[2]?.results || []).map((i: any) => ({ ...i, media_type: 'tv' }))
          ].map((i: any) => ({
            ...i,
            media_type: i.media_type || 'movie',
            _searchScore: scoreItem(i, bestMatch.toLowerCase()) + bestScore * 0.5,
            _correctedFrom: q,
            _correctedTo: bestMatch
          }));
          console.log(`[smartSearch] Typo recovered! ${rawItems.length} results for "${bestMatch}"`);
        }
      }
    }

    // Deduplicate
    const seen = new Map();
    rawItems.forEach(item => {
      if (item && item.id && !seen.has(item.id)) {
        seen.set(item.id, item);
      }
    });
    
    let items = Array.from(seen.values());

    // Filter and Map
    items = items.filter(isValid).map((i: any) => {
      const score = scoreItem(i, q, detectedGenreId);
      const title = (i.title || i.name || "").toLowerCase();
      return {
        ...i,
        _searchScore: score,
        _source: i.media_type,
        _isExactMatch: title === q,
        _matchType: title === q ? 'exact' : (title.startsWith(q) ? 'partial' : 'similar')
      };
    });

    // Sort
    items.sort((a: any, b: any) => b._searchScore - a._searchScore);

    let finalResults = items.slice(0, 24);
    let finalMovies = items.filter(i => i.media_type === "movie").slice(0, 15);
    let personData: SearchResponse['actor'] = null;
    const topMatch = items[0] || null;

    // 🎭 Actor Search Integration (Triggered if query looks like a name or if top match is a person)
    const topPerson = items.find(i => i.media_type === "person");
    const isNameQuery = q.split(" ").length >= 2;

    if (topPerson && (topPerson._isExactMatch || isNameQuery || (topPerson.popularity ?? 0) > 15)) {
      const credits = await fetchWithRetry(`${TMDB_BASE}/person/${topPerson.id}/movie_credits?api_key=${API_KEY}`);
      
      if (credits && credits.cast) {
        const actorMovies = credits.cast
          .filter((m: any) => m.poster_path && (m.vote_count ?? 0) > 100)
          .map((m: any) => ({
            ...m,
            media_type: 'movie',
            _source: 'person_credit',
            _searchScore: scorePersonMovie(m)
          }))
          .sort((a: any, b: any) => b._searchScore - a._searchScore)
          .slice(0, 15);

        if (actorMovies.length > 0) {
          finalMovies = actorMovies;
          personData = {
            id: topPerson.id,
            name: topPerson.name,
            profile_path: topPerson.profile_path,
            known_for_department: topPerson.known_for_department
          };
        }
      }
    }

    const response: SearchResponse = { 
      topMatch, 
      actor: personData,
      movies: finalMovies, 
      tv: items.filter(i => i.media_type === "tv").slice(0, 12), 
      people: items.filter(i => i.media_type === "person").slice(0, 5), 
      results: finalResults 
    };

    if (!topMatch) {
      const trendingData = await fetchWithRetry(`${TMDB_BASE}/trending/movie/week?api_key=${API_KEY}`);
      const trendingItems = (trendingData?.results || []).slice(0, 12).map((i: any) => ({
        ...i,
        id: `fb-${i.id}`, 
        _source: 'movie',
        media_type: 'movie',
        _searchScore: 0
      }));

      return {
        ...response,
        movies: trendingItems,
        results: trendingItems,
        empty: true
      };
    }

    return response;

  } catch (error) {
    console.error("SmartSearch Fatal Error:", error);
    return emptyResponse;
  }
}

/**
 * Suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  try {
    const data = await fetchWithRetry(`${TMDB_BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=1&include_adult=false`);
    const results: string[] = (data?.results || []).map((item: any) => (item.title || item.name) as string).filter(Boolean);
    return Array.from(new Set(results)).slice(0, 8);
  } catch (e) {
    return [];
  }
}

/**
 * Debounce
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
