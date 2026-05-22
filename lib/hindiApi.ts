import { TMDBMovie } from "./types";
import { fetchAPI } from "./api";

export interface HindiMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
}

// Cache for storing fetched Hindi movies
const hindiMoviesCache = new Map<number, HindiMovie>();
const fetchedYears = new Set<number>();

export const hindiApi = {
  async fetchHindiMovies(limit: number = 250): Promise<HindiMovie[]> {
    // Return cached data if available
    if (hindiMoviesCache.size >= limit) {
      return Array.from(hindiMoviesCache.values()).slice(0, limit);
    }

    const currentYear = new Date().getFullYear();
    const movies: HindiMovie[] = [];
    let year = currentYear;

    // Fetch movies year by year starting from 2026
    while (movies.length < limit && year >= 2000) { // Start from 2000 for reasonable range
      if (!fetchedYears.has(year)) {
        fetchedYears.add(year);
        
        try {
          // Fetch movies for this year
          const response = await this.fetchHindiMoviesByYear(year);
          
          // Process and add to cache
          response.results.forEach(movie => {
            if (!hindiMoviesCache.has(movie.id)) {
              const hindiMovie: HindiMovie = {
                id: movie.id,
                title: movie.title,
                year: parseInt(movie.release_date?.split('-')[0] || year.toString()),
                rating: movie.vote_average,
                posterUrl: movie.poster_path 
                  ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
                  : null,
                backdropUrl: movie.backdrop_path 
                  ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
                  : null,
                overview: movie.overview
              };
              
              hindiMoviesCache.set(movie.id, hindiMovie);
              movies.push(hindiMovie);
            }
          });

          // Continue fetching more pages for this year if needed
          if (response.total_pages > 1 && movies.length < limit) {
            for (let page = 2; page <= Math.min(response.total_pages, 5); page++) {
              try {
                const pageResponse = await this.fetchHindiMoviesByYear(year, page);
                pageResponse.results.forEach(movie => {
                  if (!hindiMoviesCache.has(movie.id)) {
                    const hindiMovie: HindiMovie = {
                      id: movie.id,
                      title: movie.title,
                      year: parseInt(movie.release_date?.split('-')[0] || year.toString()),
                      rating: movie.vote_average,
                      posterUrl: movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
                        : null,
                      backdropUrl: movie.backdrop_path 
                        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
                        : null,
                      overview: movie.overview
                    };
                    
                    hindiMoviesCache.set(movie.id, hindiMovie);
                    movies.push(hindiMovie);
                  }
                });
                
                if (movies.length >= limit) break;
              } catch (error) {
                console.error(`Error fetching page ${page} for year ${year}:`, error);
                break;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching Hindi movies for year ${year}:`, error);
        }
      }
      
      year--; // Move to previous year
    }

    // Sort by year (newest first) and then by rating
    const sortedMovies = Array.from(hindiMoviesCache.values())
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Newest year first
        }
        return b.rating - a.rating; // Higher rating first within same year
      })
      .slice(0, limit);

    return sortedMovies;
  },

  async fetchHindiMoviesByYear(year: number, page: number = 1): Promise<{ results: TMDBMovie[], total_pages: number }> {
    const baseUrl = "https://api.themoviedb.org/3/discover/movie";
    const params = new URLSearchParams({
      with_original_language: "hi",
      sort_by: "popularity.desc",
      include_adult: "false",
      include_video: "false",
      primary_release_year: year.toString(),
      page: page.toString(),
      api_key: process.env.TMDB_API_KEY || ""
    });

    const response = await fetchAPI(`${baseUrl}?${params}`) as any;
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1
    };
  },

  // Get cached movies count
  getCachedCount(): number {
    return hindiMoviesCache.size;
  },

  // Clear cache
  clearCache(): void {
    hindiMoviesCache.clear();
    fetchedYears.clear();
  }
};
