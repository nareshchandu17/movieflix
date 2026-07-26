/**
 * @file sportsAndFitnessService.ts
 * @description Production-grade curation service for "Sports & Fitness Series" carousel on MovieFlix.
 * Intelligently searches multiple TMDB endpoints, merges, deduplicates, filters invalid entries,
 * calculates a weighted ranking score, and sorts with newest releases first and high-attention anchors.
 *
 * @author Senior Software Engineer (Content Discovery Experience)
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { TMDBTVShow, TMDBTrendingResponse, TMDBSearchResponse } from "@/lib/types";
import { fetchAPI } from "@/lib/api";

const BASE_URL = "https://api.themoviedb.org/3";

// In-memory cache for 0ms UI delivery after first compute
let cachedSportsSeries: { data: TMDBTVShow[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// TMDB Keyword IDs for Sports, Racing, Fitness, Combat, Athletics, and Games
const SPORTS_KEYWORDS_BATCH_1 = "6075|6078|6076|2336|6077|6081|6079"; // Sport, Football, Basketball, Cricket, Baseball, Tennis, Olympics
const SPORTS_KEYWORDS_BATCH_2 = "10683|9748|161048|1436|6080|1461|10714|18054|163077|208264|15011"; // Racing, F1, Boxing, Wrestling, Martial Arts, MMA/UFC, Fitness, Gym, Bodybuilding

// Search queries designed to capture global Hollywood, Bollywood/Indian, and International sports gems
const TARGETED_SEARCH_QUERIES = [
  "Sports",
  "Fitness",
  "Football",
  "Cricket",
  "Formula 1",
  "Drive to Survive",
  "Basketball",
  "UFC",
  "Boxing",
  "Wrestling",
  "Olympics",
  "Gym",
  "Bodybuilding",
  "Welcome to Wrexham",
  "The Last Dance",
  "Ted Lasso",
  "All American",
  "Cobra Kai",
  "Sunderland 'Til I Die",
  "Break Point",
  "Full Swing",
  "Roar of the Lion",
  "Selection Day",
  "Inside Edge"
];

// Attention-grabbing benchmark titles for the first 6 slots in the row
const ANCHOR_ATTENTION_TITLES = [
  "formula 1: drive to survive",
  "ted lasso",
  "the last dance",
  "welcome to wrexham",
  "cobra kai",
  "all american",
  "cheer",
  "sunderland 'til i die",
  "break point",
  "full swing",
  "inside edge",
  "roar of the lion",
  "selection day",
  "haikyu!!"
];

/**
 * Fetches, filters, ranks, and curates the best 20-25 Sports & Fitness series.
 * Behaves like a manually curated Netflix row.
 */
export async function getSportsAndFitnessSeries(forceRefresh = false): Promise<TMDBTVShow[]> {
  const now = Date.now();
  if (!forceRefresh && cachedSportsSeries && now - cachedSportsSeries.timestamp < CACHE_TTL_MS) {
    return cachedSportsSeries.data;
  }

  try {
    // 1. FETCH STRATEGY: Parallel requests across discover and search endpoints
    const discoverPromises = [
      // Popularity sorted sports keywords (Batch 1 & 2)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_1}&sort_by=popularity.desc&page=1`
      ),
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_1}&sort_by=popularity.desc&page=2`
      ),
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_2}&sort_by=popularity.desc&page=1`
      ),
      // Top rated critically acclaimed sports series (vote_count >= 50)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_1}&sort_by=vote_average.desc&vote_count.gte=50&page=1`
      ),
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_2}&sort_by=vote_average.desc&vote_count.gte=50&page=1`
      ),
      // Latest releases (first_air_date sorted)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_keywords=${SPORTS_KEYWORDS_BATCH_1}&sort_by=first_air_date.desc&vote_count.gte=20&page=1`
      ),
      // Sports Documentaries (Genre 99 + Sports keywords)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_genres=99&with_keywords=${SPORTS_KEYWORDS_BATCH_1}|${SPORTS_KEYWORDS_BATCH_2}&sort_by=popularity.desc&page=1`
      ),
      // Sports Dramas (Genre 18 + Sports keywords)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_genres=18&with_keywords=${SPORTS_KEYWORDS_BATCH_1}|${SPORTS_KEYWORDS_BATCH_2}&sort_by=popularity.desc&page=1`
      ),
      // Indian (Bollywood/Tollywood/Kollywood/Mollywood/Sandalwood) Sports Content
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_original_language=hi|te|ta|ml|kn&with_keywords=${SPORTS_KEYWORDS_BATCH_1}|${SPORTS_KEYWORDS_BATCH_2}&sort_by=popularity.desc&page=1`
      ),
      // Asian / International Sports Content (Korean, Japanese, etc.)
      fetchAPI<TMDBTrendingResponse>(
        `${BASE_URL}/discover/tv?with_original_language=ja|ko|es|fr|de|pt&with_keywords=${SPORTS_KEYWORDS_BATCH_1}|${SPORTS_KEYWORDS_BATCH_2}&sort_by=popularity.desc&page=1`
      )
    ];

    const searchPromises = TARGETED_SEARCH_QUERIES.map((query) =>
      fetchAPI<TMDBSearchResponse>(
        `${BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=1`
      )
    );

    // Run all fetches concurrently with graceful error handling
    const allResults = await Promise.allSettled([...discoverPromises, ...searchPromises]);

    // 2. DEDUPLICATION: Remove duplicate shows using TMDB ID
    const uniqueShowsMap = new Map<number, TMDBTVShow>();

    for (const res of allResults) {
      if (res.status === "fulfilled" && res.value && Array.isArray(res.value.results)) {
        for (const item of res.value.results) {
          const show = item as TMDBTVShow;
          if (show && show.id && !uniqueShowsMap.has(show.id)) {
            uniqueShowsMap.set(show.id, show);
          }
        }
      }
    }

    // 3. DATA QUALITY: Strict filtering
    const sportsTerms = [
      "sport", "football", "soccer", "cricket", "basketball", "baseball", "tennis",
      "formula 1", "f1", "racing", "mma", "ufc", "boxing", "wrestling", "olympic",
      "athlete", "athletics", "gym", "fitness", "bodybuilding", "martial arts",
      "tournament", "championship", "coach", "stadium", "league", "match", "fighter",
      "wrexham", "nba", "nfl", "fifa", "ipl", "cheer", "rugby", "golf", "skate", "surf",
      "lasso", "karate", "dojo", "racer", "grand prix", "premier league", "boxer", "striker"
    ];

    const validShows = Array.from(uniqueShowsMap.values()).filter((show) => {
      // Must have poster_path and backdrop_path (prefer high-resolution 16:9 & poster)
      if (!show.poster_path || !show.backdrop_path) return false;

      // Must have valid overview
      if (!show.overview || show.overview.trim().length < 15) return false;

      // Must have valid first_air_date
      if (!show.first_air_date || isNaN(new Date(show.first_air_date).getTime())) return false;

      // Must have vote_average >= 6.5 and vote_count >= 50
      if ((show.vote_average || 0) < 6.5) return false;
      if ((show.vote_count || 0) < 50) return false;

      // Verify affinity to sports/fitness to prevent unrelated shows
      const text = `${show.name} ${show.overview}`.toLowerCase();
      const isAnchor = ANCHOR_ATTENTION_TITLES.some((t) => text.includes(t));
      const hasSportsTerm = sportsTerms.some((term) => text.includes(term));

      return isAnchor || hasSportsTerm;
    });

    if (validShows.length === 0) {
      return [];
    }

    // 4. RANKING: Weighted score calculation
    const maxPopularity = Math.max(...validShows.map((s) => s.popularity || 1), 1);
    const currentYear = new Date().getFullYear();

    const scoredShows = validShows.map((show) => {
      const normPopularity = ((show.popularity || 0) / maxPopularity) * 10; // 0 to 10
      const voteAvg = show.vote_average || 0; // 0 to 10
      const logVotes = Math.log10(Math.max(show.vote_count || 1, 10)) * 2; // ~3.4 to 10
      
      const airYear = new Date(show.first_air_date).getFullYear();
      const ageYears = Math.max(0, currentYear - airYear);
      const recency = Math.max(0, 10 - ageYears * 0.5); // 0 to 10

      // Score formula: (popularity × 0.40) + (vote_average × 0.35) + (log(vote_count) × 0.15) + (recency × 0.10)
      const score = (normPopularity * 0.40) + (voteAvg * 0.35) + (logVotes * 0.15) + (recency * 0.10);

      return { show, score, airDate: new Date(show.first_air_date).getTime() };
    });

    // 5. SORTING: Primary: Newest releases first, Secondary: Higher quality first
    scoredShows.sort((a, b) => {
      const airYearA = new Date(a.show.first_air_date).getFullYear();
      const airYearB = new Date(b.show.first_air_date).getFullYear();

      // If one is from recent years (within last 3 years) and newer by 2+ years, prioritize if quality is high
      if (Math.abs(airYearA - airYearB) >= 2 && (a.score >= 5.5 || b.score >= 5.5)) {
        if (airYearA > airYearB) return -1;
        if (airYearB > airYearA) return 1;
      }

      // Otherwise, rank by calculated weighted score descending
      return b.score - a.score;
    });

    const rankedShows = scoredShows.map((item) => item.show);

    // 6. USER EXPERIENCE & LIMIT: First 6 titles immediately grab attention, return top 20-25
    const anchorShows: TMDBTVShow[] = [];
    const generalShows: TMDBTVShow[] = [];

    for (const show of rankedShows) {
      const nameLower = show.name.toLowerCase();
      if (anchorShows.length < 6 && ANCHOR_ATTENTION_TITLES.some((anchor) => nameLower.includes(anchor))) {
        anchorShows.push(show);
      } else {
        generalShows.push(show);
      }
    }

    // Sort anchor shows by newest release first so the first row cards are fresh and iconic
    anchorShows.sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime());

    const curatedCarousel = [...anchorShows, ...generalShows].slice(0, 25);

    // Cache the curated result
    cachedSportsSeries = {
      data: curatedCarousel,
      timestamp: Date.now()
    };

    return curatedCarousel;
  } catch (error) {
    console.error("[SportsAndFitnessService] Error generating curated carousel:", error);
    return cachedSportsSeries?.data || [];
  }
}
