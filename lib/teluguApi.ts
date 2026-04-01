import { TMDBMovie } from "./types";
import { fetchAPI } from "./api";

export interface TeluguMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
}

// Cache for storing fetched Telugu movies
const teluguMoviesCache = new Map<number, TeluguMovie>();
const fetchedYears = new Set<number>();

export const teluguApi = {
  async fetchTeluguMovies(limit: number = 1000): Promise<TeluguMovie[]> {
    // Return cached data if available
    if (teluguMoviesCache.size >= limit) {
      return Array.from(teluguMoviesCache.values()).slice(0, limit);
    }

    const currentYear = new Date().getFullYear();
    const movies: TeluguMovie[] = [];
    let year = currentYear;

    // Fetch movies year by year starting from 2026
    while (movies.length < limit && year >= 2000) { // Start from 2000 for reasonable range
      if (!fetchedYears.has(year)) {
        fetchedYears.add(year);
        
        try {
          // Fetch movies for this year
          const response = await this.fetchTeluguMoviesByYear(year);
          
          // Process and add to cache
          response.results.forEach(movie => {
            if (!teluguMoviesCache.has(movie.id)) {
              const teluguMovie: TeluguMovie = {
                id: movie.id,
                title: movie.title,
                year: parseInt(movie.release_date?.split('-')[0] || year.toString()),
                rating: movie.vote_average,
                posterUrl: movie.poster_path 
                  ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}` 
                  : null,
                backdropUrl: movie.backdrop_path 
                  ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` 
                  : null,
                overview: movie.overview
              };
              
              teluguMoviesCache.set(movie.id, teluguMovie);
              movies.push(teluguMovie);
            }
          });

          // Continue fetching more pages for this year if needed
          if (response.total_pages > 1 && movies.length < limit) {
            for (let page = 2; page <= Math.min(response.total_pages, 10); page++) {
              try {
                const pageResponse = await this.fetchTeluguMoviesByYear(year, page);
                pageResponse.results.forEach(movie => {
                  if (!teluguMoviesCache.has(movie.id)) {
                    const teluguMovie: TeluguMovie = {
                      id: movie.id,
                      title: movie.title,
                      year: parseInt(movie.release_date?.split('-')[0] || year.toString()),
                      rating: movie.vote_average,
                      posterUrl: movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}` 
                        : null,
                      backdropUrl: movie.backdrop_path 
                        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` 
                        : null,
                      overview: movie.overview
                    };
                    
                    teluguMoviesCache.set(movie.id, teluguMovie);
                    movies.push(teluguMovie);
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
          console.error(`Error fetching Telugu movies for year ${year}:`, error);
        }
      }
      
      year--; // Move to previous year
    }

    // Sort by year (newest first) and then by rating
    const sortedMovies = Array.from(teluguMoviesCache.values())
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Newest year first
        }
        return b.rating - a.rating; // Higher rating first within same year
      })
      .slice(0, limit);

    return sortedMovies;
  },

  async fetchTeluguMoviesByYear(year: number, page: number = 1): Promise<{ results: TMDBMovie[], total_pages: number }> {
    const baseUrl = "https://api.themoviedb.org/3/discover/movie";
    const params = new URLSearchParams({
      with_original_language: "te",
      sort_by: "popularity.desc",
      include_adult: "false",
      include_video: "false",
      primary_release_year: year.toString(),
      page: page.toString(),
      api_key: "9abb949e34b5c04e7f1b0ad95ece7212"
    });

    const response = await fetchAPI(`${baseUrl}?${params}`) as any;
    return {
      results: response.results || [],
      total_pages: response.total_pages || 1
    };
  },

  // Get cached movies count
  getCachedCount(): number {
    return teluguMoviesCache.size;
  },

  // Clear cache
  clearCache(): void {
    teluguMoviesCache.clear();
    fetchedYears.clear();
  }
};
