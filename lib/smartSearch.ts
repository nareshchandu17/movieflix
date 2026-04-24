import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { getGeminiService } from "@/lib/geminiService";

// ==========================================
// 1. QUERY CLASSIFICATION
// ==========================================
export enum QueryType {
  KEYWORD = "KEYWORD",
  SEMANTIC = "SEMANTIC",
  MOOD = "MOOD",
  PERSON = "PERSON",
  GENRE = "GENRE",
  TRENDING = "TRENDING",
  HYBRID = "HYBRID",
}

const MOOD_MAP: Record<string, { genres: number[]; keywords: string[] }> = {
  "sad": { genres: [18], keywords: ["loss", "death", "love", "tragedy"] },
  "emotional": { genres: [18], keywords: ["heartbreaking", "moving"] },
  "happy": { genres: [35, 10751], keywords: [] },
  "feel good": { genres: [35, 10751], keywords: [] },
  "thrilling": { genres: [28, 53], keywords: [] },
  "rainy day": { genres: [18, 14, 10749], keywords: ["cozy", "thoughtful"] }
};

const GENRE_MAP: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36,
  horror: 27, music: 10402, mystery: 9648, romance: 10749, science: 878,
  "sci-fi": 878, thriller: 53, war: 10752, western: 37,
};

function classifyQuery(query: string): QueryType {
  const q = query.toLowerCase().trim();

  // Advanced Comparisons / Semantic
  if (q.includes("movies like ") || q.includes("shows like ") || q.includes("better than ") || q.includes("mind bending")) {
    return QueryType.SEMANTIC;
  }
  
  if (q.includes("latest") || q.includes("trending") || q.includes("new movies") || q.includes("top rated")) {
    return QueryType.TRENDING;
  }

  const moodWords = Object.keys(MOOD_MAP).filter((m) => q.includes(m));
  const genreWords = Object.keys(GENRE_MAP).filter((g) => q.includes(g));

  if (moodWords.length > 0 && genreWords.length > 0) return QueryType.HYBRID;
  if (moodWords.length > 0) return QueryType.MOOD;
  if (genreWords.length > 0) return QueryType.GENRE;

  if (q.endsWith(" movies") || q.endsWith(" shows") || q.includes(" with ")) {
    const potentialName = q.replace(/ movies| shows/g, "").replace(/movies with /g, "").trim();
    if (potentialName.split(" ").length >= 2) return QueryType.PERSON; 
  }

  return QueryType.KEYWORD;
}

// ==========================================
// 2. TMDB FETCH FUNCTIONS (STRATEGY ROUTER)
// ==========================================
const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  try {
    const searchParams = new URLSearchParams(params);
    searchParams.set("api_key", process.env.NEXT_PUBLIC_TMDB_API_KEY || "");
    const res = await fetch(`${TMDB_BASE}${endpoint}?${searchParams.toString()}`);
    if (!res.ok) return { results: [] };
    return res.json();
  } catch (error) {
    console.error("TMDB Fetch Error", error);
    return { results: [] };
  }
}

async function fetchKeywordSearch(query: string) {
  const [movies, tv] = await Promise.all([
    tmdbFetch("/search/movie", { query, include_adult: "false" }),
    tmdbFetch("/search/tv", { query, include_adult: "false" }),
  ]);
  return [...(movies.results || []), ...(tv.results || [])];
}

async function fetchSemanticSearch(query: string) {
  // Use Gemini to extract exact movie titles to search for
  try {
    const gemini = getGeminiService();
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      // Direct fetch if geminiService doesn't expose a suitable method
      const prompt = `You are a movie recommendation engine. The user searched for: "${query}". Return a JSON array of 5 exact movie titles that match this intent perfectly. Only return the JSON array ["Title 1", "Title 2"].`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const match = text.match(/\[[\s\S]*\]/);
          if (match) {
            const titles: string[] = JSON.parse(match[0]);
            const promises = titles.map(t => tmdbFetch("/search/movie", { query: t }));
            const results = await Promise.all(promises);
            let combined: any[] = [];
            results.forEach(r => { if (r.results && r.results.length > 0) combined.push(r.results[0]); });
            if (combined.length > 0) return combined;
          }
        }
      }
    }
  } catch (e) {
    console.error("Gemini semantic search failed", e);
  }

  // Fallback Semantic strategy
  const baseTitle = query.toLowerCase().replace(/movies like |shows like |better than /g, "").trim();
  const baseSearch = await tmdbFetch("/search/movie", { query: baseTitle });
  if (!baseSearch.results || baseSearch.results.length === 0) return fetchKeywordSearch(query);
  
  const baseId = baseSearch.results[0].id;
  const recommendations = await tmdbFetch(`/movie/${baseId}/recommendations`);
  const similar = await tmdbFetch(`/movie/${baseId}/similar`);
  return [...(recommendations.results || []), ...(similar.results || [])];
}

async function fetchMoodSearch(query: string) {
  const q = query.toLowerCase();
  const mood = Object.keys(MOOD_MAP).find((m) => q.includes(m));
  if (!mood) return fetchKeywordSearch(query);
  
  const genres = MOOD_MAP[mood].genres.join(",");
  const res = await tmdbFetch("/discover/movie", { with_genres: genres });
  return res.results || [];
}

async function fetchPersonSearch(query: string) {
  const name = query.toLowerCase().replace(/ movies| shows/g, "").replace(/movies with /g, "").trim();
  const personSearch = await tmdbFetch("/search/person", { query: name });
  if (!personSearch.results || personSearch.results.length === 0) return fetchKeywordSearch(query);
  
  const personId = personSearch.results[0].id;
  const credits = await tmdbFetch(`/person/${personId}/movie_credits`);
  return credits.cast || [];
}

async function fetchGenreSearch(query: string) {
  const q = query.toLowerCase();
  const genreIds = Object.keys(GENRE_MAP)
    .filter((g) => q.includes(g))
    .map((g) => GENRE_MAP[g]);
    
  if (genreIds.length === 0) return fetchKeywordSearch(query);
  
  const params: Record<string, string> = { with_genres: genreIds.join(",") };
  
  // Regional checks
  if (q.includes("telugu")) params.with_original_language = "te";
  if (q.includes("hindi")) params.with_original_language = "hi";
  if (q.includes("indian")) params.with_origin_country = "IN";
  
  const res = await tmdbFetch("/discover/movie", params);
  return res.results || [];
}

async function fetchTrendingSearch() {
  const [trending, nowPlaying, topRated] = await Promise.all([
    tmdbFetch("/trending/all/day"),
    tmdbFetch("/movie/now_playing"),
    tmdbFetch("/movie/top_rated")
  ]);
  return [...(trending.results || []), ...(nowPlaying.results || []), ...(topRated.results || [])];
}

async function fetchHybridSearch(query: string) {
  const q = query.toLowerCase();
  const mood = Object.keys(MOOD_MAP).find((m) => q.includes(m));
  const genreIds = Object.keys(GENRE_MAP)
    .filter((g) => q.includes(g))
    .map((g) => GENRE_MAP[g]);
    
  let allGenres = [...genreIds];
  if (mood) allGenres = [...allGenres, ...MOOD_MAP[mood].genres];
  
  const uniqueGenres = Array.from(new Set(allGenres));
  const res = await tmdbFetch("/discover/movie", { with_genres: uniqueGenres.join(",") });
  return res.results || [];
}

// ==========================================
// 3. GLOBAL FILTERS
// ==========================================
function applyGlobalFilters(results: any[]) {
  const seen = new Set();
  const unique = results.filter(item => {
    if (!item || !item.id) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return unique.filter((item) => {
    // If it's a person/actor credit, it might be sparse, so handle safely
    if (item.popularity && item.popularity < 1) return false; 
    if (!item.poster_path) return false;
    if (!item.release_date && !item.first_air_date) return false;
    return true;
  });
}

// ==========================================
// 4. RANKING FUNCTIONS (PER TYPE)
// ==========================================
function extractYear(dateStr?: string) {
  if (!dateStr) return 0;
  return new Date(dateStr).getFullYear();
}

function rankResults(results: any[], type: QueryType, query: string) {
  const q = query.toLowerCase();
  const currentYear = new Date().getFullYear();

  return results.map(item => {
    const title = (item.title || item.name || "").toLowerCase();
    let score = 0;
    
    const rating = item.vote_average || 0;
    const popularity = Math.min((item.popularity || 0) / 10, 50);
    const year = extractYear(item.release_date || item.first_air_date);
    const recency = year > 0 ? Math.max(0, 10 - (currentYear - year)) : 0;
    
    let globalBoost = 0;
    if (rating > 7) globalBoost += 10;
    if (popularity > 30) globalBoost += 10;

    // Fuzzy logic boost for title match
    if (title === q) globalBoost += 200;
    else if (title.includes(q)) globalBoost += 50;

    switch (type) {
      case QueryType.KEYWORD: {
        const exactMatchBoost = title === q ? 1 : title.includes(q) ? 0.5 : 0;
        score = (exactMatchBoost * 100) + (rating * 3) + (popularity * 2);
        break;
      }
      case QueryType.SEMANTIC: {
        const similarityScore = 10;
        score = (similarityScore * 5) + (rating * 3) + (popularity * 2);
        break;
      }
      case QueryType.MOOD: {
        const emotionMatch = 10;
        score = (emotionMatch * 5) + (rating * 3) + (popularity * 2);
        break;
      }
      case QueryType.PERSON: {
        const roleWeight = item.order && item.order < 5 ? 10 : 5;
        score = (roleWeight * 5) + (rating * 3) + (popularity * 2);
        break;
      }
      case QueryType.GENRE: {
        score = (rating * 3) + (popularity * 3) + (recency * 2);
        break;
      }
      case QueryType.TRENDING: {
        score = (recency * 5) + (popularity * 3);
        break;
      }
      case QueryType.HYBRID: {
        const multiMatch = 10;
        score = (multiMatch * 5) + (rating * 3) + (popularity * 2);
        break;
      }
    }

    return { ...item, _searchScore: score + globalBoost };
  }).sort((a, b) => b._searchScore - a._searchScore);
}

// ==========================================
// 5. MAIN ROUTER / PIPELINE
// ==========================================
export async function smartSearch(
  query: string,
  options: { maxResults?: number; includeMovies?: boolean; includeTV?: boolean; includePeople?: boolean } = {}
) {
  const { maxResults = 20 } = options;

  // Edge Case Handling: Garbage queries
  if (query.trim().length < 2 || !/[a-zA-Z0-9]/.test(query)) {
    return []; // Return empty instead of crashing
  }

  // 1. Classify
  const type = classifyQuery(query);

  // 2. Strategy & Fetch
  let rawResults: any[] = [];
  try {
    switch (type) {
      case QueryType.SEMANTIC: rawResults = await fetchSemanticSearch(query); break;
      case QueryType.MOOD: rawResults = await fetchMoodSearch(query); break;
      case QueryType.PERSON: rawResults = await fetchPersonSearch(query); break;
      case QueryType.GENRE: rawResults = await fetchGenreSearch(query); break;
      case QueryType.TRENDING: rawResults = await fetchTrendingSearch(); break;
      case QueryType.HYBRID: rawResults = await fetchHybridSearch(query); break;
      case QueryType.KEYWORD: default: rawResults = await fetchKeywordSearch(query); break;
    }
  } catch (error) {
    console.error("Search fetch error", error);
  }

  // Fallback System
  if (!rawResults || rawResults.length === 0) {
    rawResults = await fetchTrendingSearch(); // Fallback to popular
  }

  // 3. Global Filters
  const filtered = applyGlobalFilters(rawResults);
  let finalResults = filtered;
  if (finalResults.length === 0 && rawResults.length > 0) {
    finalResults = rawResults; // Relax filters if nothing passes
  }

  // 4. Rank
  const ranked = rankResults(finalResults, type, query);

  return ranked.slice(0, maxResults);
}
