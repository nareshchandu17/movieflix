import { NextRequest, NextResponse } from "next/server";
import { RedisManager } from "@/lib/redis";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface MoodMapping {
  genres: string;
  name: string;
}

const MOOD_CONFIG: Record<string, MoodMapping> = {
  thrilling: {
    genres: "53|80",
    name: "Thrilling",
  },
  "feel-good": {
    genres: "35|10751",
    name: "Feel-Good",
  },
  romantic: {
    genres: "10749|18",
    name: "Romantic",
  },
  emotional: {
    genres: "18",
    name: "Emotional",
  },
  "action-packed": {
    genres: "28|12",
    name: "Action-Packed",
  },
  comedy: {
    genres: "35",
    name: "Comedy",
  },
  horror: {
    genres: "27",
    name: "Horror",
  },
  adventure: {
    genres: "12|14",
    name: "Adventure",
  },
  "sci-fi": {
    genres: "878",
    name: "Sci-Fi",
  },
  inspirational: {
    genres: "18",
    name: "Inspirational",
  },
  mystery: {
    genres: "9648|53",
    name: "Mystery",
  },
  family: {
    genres: "10751|16",
    name: "Family",
  },
};

const LANGUAGE_DISTRIBUTION = [
  { code: "te", percentage: 0.4, count: 40 },
  { code: "hi", percentage: 0.2, count: 20 },
  { code: "en", percentage: 0.2, count: 20 },
  { code: "ta", percentage: 0.1, count: 10 },
  { code: "kn", percentage: 0.1, count: 10 },
];

async function fetchMoviesFromTMDB(language: string, genres: string, count: number) {
  let movies: any[] = [];
  let page = 1;
  let currentVoteThreshold = 50;

  const performFetch = async (threshold: number, startPage: number) => {
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genres}&with_original_language=${language}&vote_count.gte=${threshold}&page=${startPage}&sort_by=popularity.desc`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  };

  try {
    // 1. Initial attempt with high quality (>= 50 votes)
    while (movies.length < count && page <= 3) {
      const results = await performFetch(currentVoteThreshold, page);
      if (results.length === 0) break;

      const filtered = results.filter((m: any) => m.poster_path && m.release_date);
      movies = [...movies, ...filtered];
      page++;
    }

    // 2. Fallback attempt with lower threshold (>= 20 votes) if we got NOTHING
    if (movies.length === 0) {
      console.log(`[Mood Engine] Relaxing threshold for ${language} to 20 votes...`);
      currentVoteThreshold = 20;
      page = 1; // Reset page for new search
      while (movies.length < count && page <= 3) {
        const results = await performFetch(currentVoteThreshold, page);
        if (results.length === 0) break;

        const filtered = results.filter((m: any) => m.poster_path && m.release_date);
        movies = [...movies, ...filtered];
        page++;
      }
    }
    
    return movies.slice(0, count);
  } catch (error) {
    console.error(`TMDB fetch failed for ${language}:`, error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawMood = searchParams.get("mood") || "";
    const mood = rawMood.toLowerCase();

    if (!MOOD_CONFIG[mood]) {
      return NextResponse.json({ error: "Invalid or unsupported mood" }, { status: 400 });
    }

    // 1. Check Cache
    const cacheKey = `ai_mood:${mood}`;
    const cachedData = await RedisManager.get(cacheKey);
    if (cachedData) {
      console.log(`[Mood Engine] Serving cached results for: ${mood}`);
      return NextResponse.json(cachedData);
    }

    // 2. Fetch concurrently
    console.log(`[Mood Engine] Fetching fresh data for: ${mood}`);
    const genreIds = MOOD_CONFIG[mood].genres;
    
    const requests = LANGUAGE_DISTRIBUTION.map((lang) => 
      fetchMoviesFromTMDB(lang.code, genreIds, lang.count)
    );

    const results = await Promise.all(requests);
    
    let finalMovies: any[] = [];
    results.forEach((langResults, index) => {
      finalMovies = [...finalMovies, ...langResults];
    });

    // 3. Safety Fallback (Ensure >= 100 movies)
    if (finalMovies.length < 100) {
      console.log(`[Mood Engine] Distribution undershoot (${finalMovies.length}), fetching filler...`);
      const filler = await fetchMoviesFromTMDB("en", genreIds, 100 - finalMovies.length);
      finalMovies = [...finalMovies, ...filler];
    }

    // 4. Shuffle lightly
    // Normal shuffle: finalMovies.sort(() => Math.random() - 0.5)
    // Preserving popularity somewhat:
    finalMovies.sort(() => Math.random() * 0.3 - 0.15);

    const responsePayload = {
      mood: MOOD_CONFIG[mood].name,
      totalMovies: finalMovies.length,
      distribution: {
        telugu: results[0].length,
        hindi: results[1].length,
        english: results[2].length,
        tamil: results[3].length,
        kannada: results[4].length,
      },
      movies: finalMovies.map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        release_date: m.release_date,
        vote_average: m.vote_average,
        language: m.original_language
      })),
    };

    // 5. Cache results (6 hours)
    await RedisManager.set(cacheKey, responsePayload, 21600);

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error("AI Mood API failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
