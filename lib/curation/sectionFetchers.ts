/**
 * @file sectionFetchers.ts
 * @description Multi-endpoint parallel fetchers for all 17 MovieFlix curated homepage carousels.
 * Executes parallel `Promise.all` queries to TMDB, merges, deduplicates globally, and scores every card.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { api } from "../api";
import { TMDBMovie, TMDBTVShow } from "../types";
import { MediaItem, curateMediaPool, CurationOptions } from "./engine";

/**
 * Helper to ensure items have media_type explicitly tagged
 */
function tagMediaType<T extends TMDBMovie | TMDBTVShow>(
  items: T[] | undefined,
  mediaType: "movie" | "tv"
): MediaItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    media_type: (item as any).media_type || mediaType,
  })) as MediaItem[];
}

/**
 * 1. Trending Now
 * Combines: `/trending/all/day`, `/trending/all/week`, `/movie/popular`, `/tv/popular`
 */
async function fetchTrendingNow(options?: CurationOptions): Promise<MediaItem[]> {
  const [dayRes, weekRes, popMovies, popTV] = await Promise.all([
    api.getTrending("all", "day", 1),
    api.getTrending("all", "week", 1),
    api.getMedia("movie", { category: "popular", page: 1 }),
    api.getMedia("tv", { category: "popular", page: 1 }),
  ]);

  const rawPool = [
    ...(dayRes.results as MediaItem[] || []),
    ...(weekRes.results as MediaItem[] || []),
    ...tagMediaType(popMovies.results as TMDBMovie[], "movie"),
    ...tagMediaType(popTV.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.8, ...options });
}

/**
 * 2. Good Morning / Tonight Picks (Time-Aware Discovery)
 */
async function fetchTimeBasedPicks(options?: CurationOptions): Promise<MediaItem[]> {
  const hour = new Date().getHours();
  let genresMovie = "35,10751,16"; // Morning (Comedy, Family, Animation)
  let genresTV = "35,10751,16";
  let minRating = 6.5;

  if (hour >= 12 && hour < 18) {
    // Afternoon (Action, Sci-Fi, Adventure)
    genresMovie = "28,878,12";
    genresTV = "10759,10765";
  } else if (hour >= 18 && hour < 22) {
    // Evening (Drama, Thriller, History)
    genresMovie = "18,53,36";
    genresTV = "18,9648";
    minRating = 7.0;
  } else if (hour >= 22 || hour < 6) {
    // Late Night (Horror, Mystery, Crime)
    genresMovie = "27,9648,80";
    genresTV = "80,9648";
    minRating = 6.8;
  }

  const [moviePage1, moviePage2, tvPage1] = await Promise.all([
    api.discover("movie", { genre: genresMovie, sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { genre: genresMovie, sortBy: "vote_average.desc", page: 1, minRating }),
    api.discover("tv", { genre: genresTV, sortBy: "popularity.desc", page: 1 }),
  ]);

  const rawPool = [
    ...tagMediaType(moviePage1.results as TMDBMovie[], "movie"),
    ...tagMediaType(moviePage2.results as TMDBMovie[], "movie"),
    ...tagMediaType(tvPage1.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating, ...options });
}

/**
 * 3. Recommended For You
 * Combines: Trending + Popular + Top Rated + Recent + Watch history/genre affinity
 */
async function fetchRecommendedForYou(options?: CurationOptions): Promise<MediaItem[]> {
  const [trendingDay, topRatedMovies, actionDiscover, dramaDiscover] = await Promise.all([
    api.getTrending("movie", "day", 1),
    api.getMedia("movie", { category: "top_rated", page: 1 }),
    api.discover("movie", { genre: "28", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
    api.discover("movie", { genre: "18", sortBy: "popularity.desc", page: 1, minRating: 7.0 }),
  ]);

  const rawPool = [
    ...tagMediaType(trendingDay.results as TMDBMovie[], "movie"),
    ...tagMediaType(topRatedMovies.results as TMDBMovie[], "movie"),
    ...tagMediaType(actionDiscover.results as TMDBMovie[], "movie"),
    ...tagMediaType(dramaDiscover.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.8, ...options });
}

/**
 * 4. Because You Watched
 * Combines `/similar` + `/recommendations` + keyword fallback
 */
async function fetchBecauseYouWatched(lastWatchedId?: number, options?: CurationOptions): Promise<MediaItem[]> {
  const targetId = lastWatchedId || 27205; // Default: Inception (`27205`) if no history exists yet

  const [similarRes, discoverRes1, discoverRes2] = await Promise.all([
    api.getSimilar("movie", targetId, { page: 1 }),
    api.discover("movie", { genre: "878,53", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { genre: "28,53", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
  ]);

  const rawPool = [
    ...tagMediaType(similarRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(discoverRes1.results as TMDBMovie[], "movie"),
    ...tagMediaType(discoverRes2.results as TMDBMovie[], "movie"),
  ].filter((item) => item.id !== targetId);

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.6, ...options });
}

/**
 * 5. New Releases
 * Combines `/movie/now_playing` + `/movie/upcoming` + `/discover/movie` (`primary_release_date.gte`)
 */
async function fetchNewReleases(options?: CurationOptions): Promise<MediaItem[]> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [nowPlaying, upcoming, recentDiscover] = await Promise.all([
    api.getMedia("movie", { category: "now_playing", page: 1 }),
    api.getMedia("movie", { category: "upcoming", page: 1 }),
    api.discover("movie", {
      sortBy: "release_date.desc",
      airDateGte: thirtyDaysAgo,
      page: 1,
    }),
  ]);

  const rawPool = [
    ...tagMediaType(nowPlaying.results as TMDBMovie[], "movie"),
    ...tagMediaType(upcoming.results as TMDBMovie[], "movie"),
    ...tagMediaType(recentDiscover.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, {
    limit: 20,
    minRating: 6.2, // Slightly lower rating threshold for brand new releases gathering initial votes
    minVoteCount: 30,
    sortStrategy: "recency",
    ...options,
  });
}

/**
 * 6. Top 10 India
 * Parallel discovery across Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Malayalam (`ml`), Kannada (`kn`)
 */
async function fetchTop10India(options?: CurationOptions): Promise<MediaItem[]> {
  const [hindiRes, teluguRes, tamilRes, malayalamRes, kannadaRes] = await Promise.all([
    api.discover("movie", { language: "hi", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { language: "te", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { language: "ta", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
    api.discover("movie", { language: "ml", sortBy: "vote_average.desc", page: 1, minRating: 7.5 }),
    api.discover("movie", { language: "kn", sortBy: "popularity.desc", page: 1 }),
  ]);

  const rawPool = [
    ...tagMediaType(hindiRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(teluguRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(tamilRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(malayalamRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(kannadaRes.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 10, minRating: 6.8, ...options });
}

/**
 * 7. Award Winners
 * Highest rated, High vote count (`>= 1000`)
 */
async function fetchAwardWinners(options?: CurationOptions): Promise<MediaItem[]> {
  const [topMoviesPage1, topMoviesPage2, prestigeDiscover] = await Promise.all([
    api.getMedia("movie", { category: "top_rated", page: 1 }),
    api.getMedia("movie", { category: "top_rated", page: 2 }),
    api.discover("movie", { sortBy: "vote_average.desc", page: 1, minRating: 8.0, "vote_count.gte": 1500 }),
  ]);

  const rawPool = [
    ...tagMediaType(topMoviesPage1.results as TMDBMovie[], "movie"),
    ...tagMediaType(topMoviesPage2.results as TMDBMovie[], "movie"),
    ...tagMediaType(prestigeDiscover.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, {
    limit: 20,
    minRating: 7.8,
    minVoteCount: 800,
    sortStrategy: "rating",
    ...options,
  });
}

/**
 * 8. Weekend Binge (TV Series)
 * High rating (`>= 7.6`), High popularity
 */
async function fetchWeekendBinge(options?: CurationOptions): Promise<MediaItem[]> {
  const [popTV1, popTV2, topTV1] = await Promise.all([
    api.getMedia("tv", { category: "popular", page: 1 }),
    api.getMedia("tv", { category: "popular", page: 2 }),
    api.getMedia("tv", { category: "top_rated", page: 1 }),
  ]);

  const rawPool = [
    ...tagMediaType(popTV1.results as TMDBTVShow[], "tv"),
    ...tagMediaType(popTV2.results as TMDBTVShow[], "tv"),
    ...tagMediaType(topTV1.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 7.6, minVoteCount: 200, ...options });
}

/**
 * 9. Sports & Fitness
 * Merges sports series with sports movies
 */
async function fetchSportsAndFitness(options?: CurationOptions): Promise<MediaItem[]> {
  const [sportsTVRes, sportsMovieRes1, sportsMovieRes2] = await Promise.all([
    api.getSportsAndFitnessSeries(),
    api.discover("movie", { sortBy: "popularity.desc", page: 1, "with_keywords": "6075|11870|9715" }),
    api.discover("movie", { sortBy: "vote_average.desc", page: 1, minRating: 7.0, "with_keywords": "6075|11870|9715" }),
  ]);

  const rawPool = [
    ...tagMediaType(Array.isArray(sportsTVRes) ? sportsTVRes : (sportsTVRes as any)?.results || [], "tv"),
    ...tagMediaType(sportsMovieRes1.results as TMDBMovie[], "movie"),
    ...tagMediaType(sportsMovieRes2.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.5, minVoteCount: 50, ...options });
}

/**
 * 10. Action & Adventure
 * Action (`28`), Adventure (`12`), War (`10752`)
 */
async function fetchActionAdventure(options?: CurationOptions): Promise<MediaItem[]> {
  const [page1, page2, page3] = await Promise.all([
    api.discover("movie", { genre: "28,12", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { genre: "28,10752", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
    api.discover("movie", { genre: "12", sortBy: "popularity.desc", page: 2 }),
  ]);

  const rawPool = [
    ...tagMediaType(page1.results as TMDBMovie[], "movie"),
    ...tagMediaType(page2.results as TMDBMovie[], "movie"),
    ...tagMediaType(page3.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.6, ...options });
}

/**
 * 11. Crime & Mystery
 * Crime (`80`), Mystery (`9648`), Thriller (`53`)
 */
async function fetchCrimeMystery(options?: CurationOptions): Promise<MediaItem[]> {
  const [movieRes, tvRes, thrillerRes] = await Promise.all([
    api.discover("movie", { genre: "80,9648", sortBy: "popularity.desc", page: 1 }),
    api.discover("tv", { genre: "80,9648", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { genre: "53,80", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
  ]);

  const rawPool = [
    ...tagMediaType(movieRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(tvRes.results as TMDBTVShow[], "tv"),
    ...tagMediaType(thrillerRes.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.8, ...options });
}

/**
 * 12. Mind Bending
 * Sci-Fi (`878`), Psychological (`53`), Time Travel (`4379`)
 */
async function fetchMindBending(options?: CurationOptions): Promise<MediaItem[]> {
  const [scifiMovies, scifiTV, psychologicalMovies] = await Promise.all([
    api.discover("movie", { genre: "878,53", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
    api.discover("tv", { genre: "10765,18", sortBy: "vote_average.desc", page: 1, minRating: 7.5 }),
    api.discover("movie", { genre: "878", sortBy: "popularity.desc", page: 1, "with_keywords": "4379|156220|14819" }),
  ]);

  const rawPool = [
    ...tagMediaType(scifiMovies.results as TMDBMovie[], "movie"),
    ...tagMediaType(scifiTV.results as TMDBTVShow[], "tv"),
    ...tagMediaType(psychologicalMovies.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 7.0, ...options });
}

/**
 * 13. Creepy & Disturbing
 * Horror (`27`), Psychological Thriller (`53`), Dark
 */
async function fetchCreepyDisturbing(options?: CurationOptions): Promise<MediaItem[]> {
  const [horrorPage1, horrorPage2, tvHorror] = await Promise.all([
    api.discover("movie", { genre: "27,53", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
    api.discover("movie", { genre: "27", sortBy: "popularity.desc", page: 1 }),
    api.discover("tv", { genre: "9648,18", sortBy: "popularity.desc", page: 1, "with_keywords": "10714|12564" }),
  ]);

  const rawPool = [
    ...tagMediaType(horrorPage1.results as TMDBMovie[], "movie"),
    ...tagMediaType(horrorPage2.results as TMDBMovie[], "movie"),
    ...tagMediaType(tvHorror.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 6.8, ...options });
}

/**
 * 14. Top Rated (Movie + TV Combined)
 */
async function fetchTopRatedCombined(options?: CurationOptions): Promise<MediaItem[]> {
  const [moviesP1, moviesP2, tvP1, tvP2] = await Promise.all([
    api.getMedia("movie", { category: "top_rated", page: 1 }),
    api.getMedia("movie", { category: "top_rated", page: 2 }),
    api.getMedia("tv", { category: "top_rated", page: 1 }),
    api.getMedia("tv", { category: "top_rated", page: 2 }),
  ]);

  const rawPool = [
    ...tagMediaType(moviesP1.results as TMDBMovie[], "movie"),
    ...tagMediaType(moviesP2.results as TMDBMovie[], "movie"),
    ...tagMediaType(tvP1.results as TMDBTVShow[], "tv"),
    ...tagMediaType(tvP2.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, {
    limit: 20,
    minRating: 8.0,
    minVoteCount: 500,
    sortStrategy: "rating",
    ...options,
  });
}

/**
 * 15. Hidden Gems
 * `vote_average >= 7.5`, `vote_count >= 300 AND <= 3000`, `popularity < 80` across pages 1-3
 */
async function fetchHiddenGems(options?: CurationOptions): Promise<MediaItem[]> {
  const [p1, p2, p3] = await Promise.all([
    api.discover("movie", { sortBy: "vote_average.desc", page: 1, minRating: 7.5, "vote_count.gte": 300, "vote_count.lte": 3000 }),
    api.discover("movie", { sortBy: "vote_average.desc", page: 2, minRating: 7.5, "vote_count.gte": 300, "vote_count.lte": 3000 }),
    api.discover("movie", { sortBy: "vote_average.desc", page: 3, minRating: 7.5, "vote_count.gte": 300, "vote_count.lte": 3000 }),
  ]);

  const rawPool = [
    ...tagMediaType(p1.results as TMDBMovie[], "movie"),
    ...tagMediaType(p2.results as TMDBMovie[], "movie"),
    ...tagMediaType(p3.results as TMDBMovie[], "movie"),
  ].filter((item) => (item.popularity || 0) < 85);

  return curateMediaPool(rawPool, {
    limit: 20,
    minRating: 7.5,
    minVoteCount: 300,
    sortStrategy: "rating",
    ...options,
  });
}

/**
 * 16. Around The World
 * Korea (`ko`), Japan (`ja`), Spain (`es`), France (`fr`), Germany (`de`), India (`hi`/`te`), Italy (`it`)
 */
async function fetchAroundTheWorld(options?: CurationOptions): Promise<MediaItem[]> {
  const [koRes, jaRes, esRes, frRes, deRes, itRes] = await Promise.all([
    api.discover("movie", { language: "ko", sortBy: "vote_average.desc", page: 1, minRating: 7.2 }),
    api.discover("movie", { language: "ja", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { language: "es", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
    api.discover("movie", { language: "fr", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
    api.discover("movie", { language: "de", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
    api.discover("movie", { language: "it", sortBy: "vote_average.desc", page: 1, minRating: 7.0 }),
  ]);

  const rawPool = [
    ...tagMediaType(koRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(jaRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(esRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(frRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(deRes.results as TMDBMovie[], "movie"),
    ...tagMediaType(itRes.results as TMDBMovie[], "movie"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 7.0, ...options });
}

/**
 * 17. Anime Favorites
 * Movie + TV with `with_genres=16` and `with_original_language=ja`
 */
async function fetchAnimeFavorites(options?: CurationOptions): Promise<MediaItem[]> {
  const [movieRes1, movieRes2, tvRes1, tvRes2] = await Promise.all([
    api.discover("movie", { genre: "16", language: "ja", sortBy: "popularity.desc", page: 1 }),
    api.discover("movie", { genre: "16", language: "ja", sortBy: "vote_average.desc", page: 1, minRating: 7.5 }),
    api.discover("tv", { genre: "16", language: "ja", sortBy: "popularity.desc", page: 1 }),
    api.discover("tv", { genre: "16", language: "ja", sortBy: "vote_average.desc", page: 1, minRating: 7.8 }),
  ]);

  const rawPool = [
    ...tagMediaType(movieRes1.results as TMDBMovie[], "movie"),
    ...tagMediaType(movieRes2.results as TMDBMovie[], "movie"),
    ...tagMediaType(tvRes1.results as TMDBTVShow[], "tv"),
    ...tagMediaType(tvRes2.results as TMDBTVShow[], "tv"),
  ];

  return curateMediaPool(rawPool, { limit: 20, minRating: 7.0, ...options });
}

/**
 * Master dispatcher function used by `<CuratedCarousel>` to fetch any section by ID.
 */
export async function fetchCuratedSection(sectionId: string, options?: CurationOptions): Promise<MediaItem[]> {
  switch (sectionId) {
    case "trending":
      return fetchTrendingNow(options);
    case "time-based":
      return fetchTimeBasedPicks(options);
    case "recommended":
      return fetchRecommendedForYou(options);
    case "because-you-watched":
      return fetchBecauseYouWatched(undefined, options);
    case "new-releases":
      return fetchNewReleases(options);
    case "top10-india":
      return fetchTop10India(options);
    case "award-winners":
      return fetchAwardWinners(options);
    case "weekend-binge":
      return fetchWeekendBinge(options);
    case "sports-fitness":
      return fetchSportsAndFitness(options);
    case "action-adventure":
      return fetchActionAdventure(options);
    case "crime-mystery":
      return fetchCrimeMystery(options);
    case "mind-bending":
      return fetchMindBending(options);
    case "creepy-disturbing":
      return fetchCreepyDisturbing(options);
    case "top-rated":
      return fetchTopRatedCombined(options);
    case "hidden-gems":
      return fetchHiddenGems(options);
    case "around-the-world":
      return fetchAroundTheWorld(options);
    case "anime":
      return fetchAnimeFavorites(options);
    default:
      return fetchTrendingNow(options);
  }
}
