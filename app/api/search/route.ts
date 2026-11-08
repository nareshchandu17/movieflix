import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

type Item = {
  id: number; media_type?: "movie" | "tv" | "person"; title?: string; name?: string;
  original_title?: string; original_name?: string; poster_path?: string | null;
  profile_path?: string | null; backdrop_path?: string | null; overview?: string;
  release_date?: string; first_air_date?: string; vote_average?: number; vote_count?: number;
  popularity?: number; adult?: boolean; genre_ids?: number[]; original_language?: string;
  known_for_department?: string; known_for?: Item[];
};
type ResponseData<T> = { results?: T[]; page?: number; total_pages?: number; total_results?: number };

const GENRES: Record<string, number> = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80, documentary: 99,
  drama: 18, family: 10751, fantasy: 14, history: 36, horror: 27, music: 10402,
  mystery: 9648, romance: 10749, "science fiction": 878, "sci fi": 878, thriller: 53,
  war: 10752, western: 37,
};
const LANGUAGES: Record<string, string> = {
  telugu: "te", tamil: "ta", hindi: "hi", kannada: "kn", malayalam: "ml",
  english: "en", korean: "ko", japanese: "ja", spanish: "es", french: "fr",
};
const MOODS: Record<string, { genres: number[]; label: string }> = {
  "feel good": { genres: [35, 10751], label: "Feel-good" },
  "feel-good": { genres: [35, 10751], label: "Feel-good" },
  "mind bending": { genres: [878, 9648, 53], label: "Mind-bending" },
  "mind-bending": { genres: [878, 9648, 53], label: "Mind-bending" },
  emotional: { genres: [18, 10749], label: "Emotional" },
  sad: { genres: [18], label: "Emotional" },
  dark: { genres: [80, 53, 27], label: "Dark" },
  suspense: { genres: [53, 9648], label: "Suspenseful" },
  scary: { genres: [27, 53], label: "Scary" },
  romantic: { genres: [10749], label: "Romantic" },
  funny: { genres: [35], label: "Funny" },
  inspirational: { genres: [18, 10751], label: "Inspirational" },
  motivational: { genres: [18, 10751], label: "Motivational" },
  relaxing: { genres: [35, 10751], label: "Relaxing" },
  "action packed": { genres: [28, 12], label: "Action-packed" },
  "date night": { genres: [10749, 35], label: "Date night" },
};

const normalize = (value: string) => value.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const titleOf = (item: Item) => item.title || item.name || item.original_title || item.original_name || "";
const dateOf = (item: Item) => item.release_date || item.first_air_date || "";
const validMedia = (item: Item) => Number.isInteger(item.id) && item.id > 0 && !!titleOf(item) && item.adult !== true;

function unique<T extends { id: number }>(items: T[]): T[] {
  const ids = new Set<number>();
  return items.filter((item) => !ids.has(item.id) && !!ids.add(item.id));
}

async function tmdb<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!ACCESS_TOKEN && !API_KEY) throw new Error("TMDB credentials are not configured");
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  if (!ACCESS_TOKEN && API_KEY) url.searchParams.set("api_key", API_KEY);
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json", ...(ACCESS_TOKEN ? { Authorization: "Bearer " + ACCESS_TOKEN } : {}) },
    next: { revalidate: 1800 },
  });
  if (!response.ok) {
    const error = new Error("TMDB request failed: " + response.status) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

function personIntent(query: string): { name: string; role: "actor" | "director" | "auto" } | null {
  const patterns: Array<{ regex: RegExp; role: "actor" | "director" | "auto" }> = [
    { regex: /^(?:movies?|films?|filmography)\s+(?:directed\s+by|by)\s+(.+)$/i, role: "director" },
    { regex: /^directed\s+by\s+(.+)$/i, role: "director" },
    { regex: /^(.+?)\s+(?:directed|films\s+directed)$/i, role: "director" },
    { regex: /^(?:movies?|films?|filmography)\s+(?:of|with|starring|featuring|acted\s+by)\s+(.+)$/i, role: "actor" },
    { regex: /^(.+?)\s+(?:movies?|films?|filmography)$/i, role: "auto" },
    { regex: /^(?:actor|actress|hero|heroine)\s+(.+)$/i, role: "actor" },
    { regex: /^(.+?)\s+(?:actor|actress|hero|heroine)$/i, role: "actor" },
  ];
  for (const pattern of patterns) {
    const match = query.trim().match(pattern.regex);
    if (match && match[1].trim()) return { name: match[1].trim(), role: pattern.role };
  }
  return null;
}

function parseQuery(query: string) {
  let remaining = query.toLowerCase().trim();
  const labels: string[] = [];
  const params: Record<string, string> = { include_adult: "false", sort_by: "popularity.desc" };
  const person = personIntent(query);
  if (person) return { person, params, labels, remaining: "" };

  for (const alias of Object.keys(LANGUAGES).sort((a, b) => b.length - a.length)) {
    const regex = new RegExp("\\b" + alias + "\\b", "i");
    if (regex.test(remaining)) {
      params.with_original_language = LANGUAGES[alias];
      labels.push(alias);
      remaining = remaining.replace(regex, " ");
      break;
    }
  }

  let moodKey: string | undefined;
  for (const mood of Object.keys(MOODS).sort((a, b) => b.length - a.length)) {
    const regex = new RegExp("\\b" + mood + "\\b", "i");
    if (regex.test(remaining)) {
      moodKey = mood;
      params.with_genres = MOODS[mood].genres.join("|");
      labels.push(MOODS[mood].label);
      remaining = remaining.replace(regex, " ");
      break;
    }
  }

  const genreIds: number[] = [];
  for (const genre of Object.keys(GENRES).sort((a, b) => b.length - a.length)) {
    const regex = new RegExp("\\b" + genre + "\\b", "i");
    if (regex.test(remaining)) {
      genreIds.push(GENRES[genre]);
      labels.push(genre);
      remaining = remaining.replace(regex, " ");
    }
  }
  if (genreIds.length) {
    params.with_genres = genreIds.join(",");
    if (moodKey) params.with_genres += "|" + MOODS[moodKey].genres.join("|");
  }

  const decade = remaining.match(/\b(19|20)\d0s\b/);
  if (decade) {
    const start = Number(decade[0].slice(0, 3) + "0");
    params["primary_release_date.gte"] = start + "-01-01";
    params["primary_release_date.lte"] = (start + 9) + "-12-31";
    labels.push(decade[0]);
    remaining = remaining.replace(decade[0], " ");
  } else {
    const after = remaining.match(/\b(?:after|since)\s+(19\d{2}|20\d{2})\b/);
    const before = remaining.match(/\b(?:before|until)\s+(19\d{2}|20\d{2})\b/);
    const exact = remaining.match(/\b(?:in|from)\s+(19\d{2}|20\d{2})\b/);
    if (after) {
      params["primary_release_date.gte"] = (Number(after[1]) + 1) + "-01-01";
      labels.push("after " + after[1]); remaining = remaining.replace(after[0], " ");
    } else if (before) {
      params["primary_release_date.lte"] = (Number(before[1]) - 1) + "-12-31";
      labels.push("before " + before[1]); remaining = remaining.replace(before[0], " ");
    } else if (exact) {
      params.primary_release_year = exact[1];
      labels.push(exact[1]); remaining = remaining.replace(exact[0], " ");
    }
  }

  const rating = remaining.match(/\b(?:rated|rating|score)\s*(?:above|over|at least)?\s*(\d(?:\.\d)?)\+?\b/i);
  if (rating) {
    params["vote_average.gte"] = rating[1];
    params["vote_count.gte"] = "50";
    params.sort_by = "vote_average.desc";
    labels.push("rating " + rating[1] + "+");
    remaining = remaining.replace(rating[0], " ");
  }

  remaining = remaining.replace(/\b(best|top|popular|movies?|films?|please|show|find|me|some|the|of|for|with|and|after|before|since|in|from)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
  return { person: null, params, labels, remaining };
}

async function resolvePerson(name: string) {
  const response = await tmdb<ResponseData<Item>>("/search/person", { query: name, include_adult: "false", page: 1 });
  const people = response.results || [];
  const wanted = normalize(name);
  return people.find((person) => normalize(person.name || "") === wanted) || people[0] || null;
}

async function getFilmography(person: Item, role: "actor" | "director") {
  const credits = await tmdb<{ cast?: Item[]; crew?: Array<Item & { job?: string }> }>(
    "/person/" + person.id + "/movie_credits", { language: "en-US" }
  );
  const creditsForRole = role === "director"
    ? (credits.crew || []).filter((credit) => credit.job === "Director")
    : (credits.cast || []);
  return unique(creditsForRole.filter(validMedia)).sort((a, b) =>
    Number(b.popularity || 0) - Number(a.popularity || 0) ||
    Number(b.vote_average || 0) - Number(a.vote_average || 0)
  );
}

function personCard(person: Item, role: "actor" | "director") {
  return {
    id: person.id, name: person.name, profile_path: person.profile_path || null,
    known_for_department: person.known_for_department || (role === "director" ? "Directing" : "Acting"),
    media_type: "person" as const, role, known_for: person.known_for || [], popularity: person.popularity || 0,
  };
}

function matchesFilters(item: Item, params: Record<string, string>, residual: string) {
  if (!validMedia(item)) return false;
  const ids = (params.with_genres || "").split(/[|,]/).filter(Boolean).map(Number);
  if (ids.length && !ids.some((id) => (item.genre_ids || []).includes(id))) return false;
  if (params.with_original_language && item.original_language !== params.with_original_language) return false;
  const release = dateOf(item);
  if (params.primary_release_year && !release.startsWith(params.primary_release_year)) return false;
  if (params["primary_release_date.gte"] && (!release || release < params["primary_release_date.gte"])) return false;
  if (params["primary_release_date.lte"] && (!release || release > params["primary_release_date.lte"])) return false;
  if (params["vote_average.gte"] && Number(item.vote_average || 0) < Number(params["vote_average.gte"])) return false;
  if (residual && !normalize(titleOf(item)).includes(normalize(residual))) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const query = (searchParams.get("query") || searchParams.get("q") || "").trim();
  const page = Math.max(1, Math.min(500, Number(searchParams.get("page") || 1)));
  const requestedType = searchParams.get("type") || "multi";
  if (!query || query.length > 100) {
    return NextResponse.json({ error: "Enter a search query between 1 and 100 characters." }, { status: 400 });
  }
  if (!ACCESS_TOKEN && !API_KEY) {
    return NextResponse.json({ error: "TMDB credentials are not configured." }, { status: 500 });
  }

  try {
    const parsed = parseQuery(query);
    let media: Item[] = [];
    let people: ReturnType<typeof personCard>[] = [];
    let intent = "title";

    if (parsed.person) {
      const person = await resolvePerson(parsed.person.name);
      if (person) {
        const role = parsed.person.role === "auto"
          ? (person.known_for_department === "Directing" ? "director" : "actor")
          : parsed.person.role;
        media = await getFilmography(person, role);
        people = [personCard(person, role)];
        intent = role === "director" ? "director" : "person";
      } else {
        intent = "person";
      }
    } else if (parsed.labels.length) {
      intent = parsed.labels.some((label) => Object.values(MOODS).some((mood) => mood.label === label)) ? "mood" : "discover";
      const response = await tmdb<ResponseData<Item>>("/discover/movie", {
        ...parsed.params, page, sort_by: parsed.params.sort_by || "popularity.desc",
      });
      media = (response.results || []).filter(validMedia);
      if (parsed.remaining) {
        const titleResponse = await tmdb<ResponseData<Item>>("/search/movie", {
          query: parsed.remaining, include_adult: "false", page,
        });
        const matchingIds = new Set(media.map((item) => item.id));
        media = (titleResponse.results || []).filter((item) => matchingIds.has(item.id) && validMedia(item));
      }
    } else {
      const mediaPath = requestedType === "movie" ? "/search/movie" : requestedType === "tv" ? "/search/tv" : "/search/multi";
      const [mediaResponse, peopleResponse] = await Promise.all([
        tmdb<ResponseData<Item>>(mediaPath, { query, include_adult: "false", page }),
        tmdb<ResponseData<Item>>("/search/person", { query, include_adult: "false", page: 1 }),
      ]);
      media = (mediaResponse.results || []).filter((item) => item.media_type !== "person" && validMedia(item));
      const exactPerson = (peopleResponse.results || []).find((person) => normalize(person.name || "") === normalize(query));
      if (exactPerson) {
        const role = exactPerson.known_for_department === "Directing" ? "director" : "actor";
        people = [personCard(exactPerson, role)];
      }
      media.sort((a, b) => {
        const wanted = normalize(query);
        const score = (item: Item) => {
          const name = normalize(titleOf(item));
          return (name === wanted ? 1000 : name.startsWith(wanted) ? 500 : name.includes(wanted) ? 200 : 0) + Math.min(100, Number(item.popularity || 0));
        };
        return score(b) - score(a);
      });
    }

    const results = unique(media).map((item) => ({
      ...item,
      media_type: item.media_type || (item.title || item.original_title ? "movie" : "tv"),
    }));
    return NextResponse.json({ query, intent, labels: parsed.labels, results, people, total_results: results.length, page });
  } catch (error) {
    console.error("[TMDB Intelligent Search] Failed:", error);
    const status = (error as Error & { status?: number }).status || 502;
    return NextResponse.json({ error: "Movie search is temporarily unavailable." }, { status });
  }
}
