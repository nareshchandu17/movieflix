import { NextRequest, NextResponse } from "next/server";
import { RedisManager } from "@/lib/redis";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

type MoodConfig = { genres: number[]; name: string };

const MOOD_CONFIG: Record<string, MoodConfig> = {
  thrilling: { genres: [53, 9648], name: "Thrilling" },
  "feel-good": { genres: [35, 10751], name: "Feel-Good" },
  romantic: { genres: [10749], name: "Romantic" },
  emotional: { genres: [18, 10749], name: "Emotional" },
  "action-packed": { genres: [28, 12], name: "Action-Packed" },
  comedy: { genres: [35], name: "Comedy" },
  horror: { genres: [27], name: "Horror" },
  adventure: { genres: [12, 14], name: "Adventure" },
  "sci-fi": { genres: [878], name: "Sci-Fi" },
  inspirational: { genres: [18, 10751], name: "Inspirational" },
  mystery: { genres: [9648], name: "Mystery" },
  family: { genres: [10751, 16], name: "Family" },
};

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult?: boolean;
  original_language?: string;
  genre_ids?: number[];
};

async function fetchMoodPage(mood: MoodConfig, page: number, language?: string) {
  const url = new URL(TMDB_BASE_URL + "/discover/movie");
  url.searchParams.set("with_genres", mood.genres.join("|"));
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("vote_count.gte", "30");
  url.searchParams.set("page", String(page));
  url.searchParams.set("language", "en-US");
  if (language) url.searchParams.set("with_original_language", language);
  if (!TMDB_ACCESS_TOKEN && TMDB_API_KEY) url.searchParams.set("api_key", TMDB_API_KEY);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      ...(TMDB_ACCESS_TOKEN ? { Authorization: "Bearer " + TMDB_ACCESS_TOKEN } : {}),
    },
    next: { revalidate: 1800 },
  });
  if (!response.ok) throw new Error("TMDB mood discovery failed: " + response.status);
  const data = await response.json();
  return (data.results || []) as TMDBMovie[];
}

export async function GET(request: NextRequest) {
  if (!TMDB_ACCESS_TOKEN && !TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB credentials are not configured." }, { status: 500 });
  }

  const params = new URL(request.url).searchParams;
  const moodId = (params.get("mood") || "").toLowerCase().trim();
  const language = (params.get("language") || "").toLowerCase().trim();
  const mood = MOOD_CONFIG[moodId];

  if (!mood) {
    return NextResponse.json({ error: "Invalid or unsupported mood." }, { status: 400 });
  }
  if (language && !/^[a-z]{2}$/.test(language)) {
    return NextResponse.json({ error: "Language must be a two-letter TMDB language code." }, { status: 400 });
  }

  const cacheKey = "tmdb_mood_v2:" + moodId + ":" + (language || "all");
  try {
    const cached = await RedisManager.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const pages = await Promise.all([1, 2].map((page) => fetchMoodPage(mood, page, language || undefined)));
    const seen = new Set<number>();
    const movies = pages.flat().filter((movie) => {
      if (!Number.isInteger(movie.id) || movie.id <= 0 || seen.has(movie.id)) return false;
      if (movie.adult || !movie.poster_path || !movie.release_date) return false;
      if (!movie.title?.trim() || !movie.overview?.trim()) return false;
      seen.add(movie.id);
      return true;
    }).slice(0, 40);

    const payload = {
      mood: mood.name,
      totalMovies: movies.length,
      distribution: language ? { [language]: movies.length } : { all: movies.length },
      // Preserve the response fields used by MoodResults; every item is a real TMDB movie.
      movies: movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path || null,
        overview: movie.overview || "",
        release_date: movie.release_date,
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        popularity: movie.popularity || 0,
        language: movie.original_language || "",
      })),
    };

    await RedisManager.set(cacheKey, payload, 1800);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[TMDB Mood Discovery] Failed:", error);
    return NextResponse.json({ error: "Mood discovery is temporarily unavailable." }, { status: 502 });
  }
}
