import { TMDBPerson, TMDBMovie } from "@/lib/types";

interface TMDBSearchResponse {
  results: TMDBPerson[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface TMDBMovieResponse {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
  total_results: number;
}

class TMDBAPI {
  private readonly baseURL = 'https://api.themoviedb.org/3';
  private readonly imageBaseURL = 'https://image.tmdb.org/t/p/w500';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('TMDB API key is required');
    }
  }

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache for 1 hour
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    }

    return data;
  }

  async searchPerson(query: string): Promise<TMDBPerson | null> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}/search/person?query=${encodedQuery}&api_key=${this.apiKey}`;
      const cacheKey = `tmdb_person_${query}`;
      
      const response: TMDBSearchResponse = await this.fetchWithCache(url, cacheKey);
      
      if (response.results && response.results.length > 0) {
        return response.results[0];
      }
      
      return null;
    } catch (error) {
      console.error(`Error searching for person: ${query}`, error);
      return null;
    }
  }

  getProfileURL(profilePath: string | null): string {
    if (!profilePath) {
      return 'https://i.imgur.com/wjVuAGb.png'; // Fallback image
    }
    return `${this.imageBaseURL}${profilePath}`;
  }

  getPosterURL(posterPath: string | null): string {
    if (!posterPath) {
      return 'https://i.imgur.com/wjVuAGb.png'; // Fallback image
    }
    return `${this.imageBaseURL}${posterPath}`;
  }

  getBackdropURL(backdropPath: string | null): string {
    if (!backdropPath) {
      return 'https://i.imgur.com/wjVuAGb.png'; // Fallback image
    }
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> {
    try {
      const url = `${this.baseURL}/trending/movie/${timeWindow}?api_key=${this.apiKey}`;
      const cacheKey = `tmdb_trending_${timeWindow}`;
      
      const response: TMDBMovieResponse = await this.fetchWithCache(url, cacheKey);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching trending movies: ${timeWindow}`, error);
      return [];
    }
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBMovie[]> {
    try {
      const url = `${this.baseURL}/discover/movie?with_genres=${genreId}&page=${page}&api_key=${this.apiKey}`;
      const cacheKey = `tmdb_genre_${genreId}_${page}`;
      
      const response: TMDBMovieResponse = await this.fetchWithCache(url, cacheKey);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching movies by genre: ${genreId}`, error);
      return [];
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBMovie[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}/search/movie?query=${encodedQuery}&page=${page}&api_key=${this.apiKey}`;
      const cacheKey = `tmdb_search_movies_${query}_${page}`;
      
      const response: TMDBMovieResponse = await this.fetchWithCache(url, cacheKey);
      return response.results || [];
    } catch (error) {
      console.error(`Error searching movies: ${query}`, error);
      return [];
    }
  }

  async getMovieVideos(movieId: number): Promise<any[]> {
    try {
      const url = `${this.baseURL}/movie/${movieId}/videos?api_key=${this.apiKey}`;
      const cacheKey = `tmdb_videos_${movieId}`;
      
      const response: any = await this.fetchWithCache(url, cacheKey);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching movie videos: ${movieId}`, error);
      return [];
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      const url = `${this.baseURL}/movie/top_rated?page=${page}&api_key=${this.apiKey}`;
      const cacheKey = `tmdb_top_rated_${page}`;
      
      const response: TMDBMovieResponse = await this.fetchWithCache(url, cacheKey);
      return response.results || [];
    } catch (error) {
      console.error(`Error fetching top rated movies`, error);
      return [];
    }
  }

  async getPopularMoviesForScenes(): Promise<TMDBMovie[]> {
    try {
      // Get movies that are likely to have iconic scenes
      const [trending, topRated, popular] = await Promise.all([
        this.getTrendingMovies('week'),
        this.getTopRatedMovies(),
        this.getMoviesByGenre(28) // Action movies tend to have great scenes
      ]);

      // Combine and deduplicate
      const allMovies = [...trending.slice(0, 5), ...topRated.slice(0, 5), ...popular.slice(0, 5)];
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      return uniqueMovies.slice(0, 12); // Return 12 movies for scene extraction
    } catch (error) {
      console.error('Error fetching popular movies for scenes:', error);
      return [];
    }
  }

  async getMultipleActors(actorNames: string[]): Promise<Array<{ name: string; profileURL: string; id: number }>> {
    const results: Array<{ name: string; profileURL: string; id: number }> = [];
    const usedIds = new Set<number>();
    
    for (let i = 0; i < actorNames.length; i++) {
      const name = actorNames[i];
      try {
        const person = await this.searchPerson(name);
        if (person) {
          // Ensure unique ID even if TMDB returns duplicate
          const uniqueId = usedIds.has(person.id) ? 30000 + i : person.id;
          usedIds.add(uniqueId);
          
          results.push({
            name: person.name,
            profileURL: this.getProfileURL(person.profile_path),
            id: uniqueId
          });
        } else {
          // Fallback for not found actors - use unique ID based on name hash
          const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const fallbackId = 40000 + i + (nameHash % 1000);
          usedIds.add(fallbackId);
          
          results.push({
            name,
            profileURL: 'https://i.imgur.com/wjVuAGb.png',
            id: fallbackId
          });
        }
      } catch (error) {
        console.error(`Error fetching actor: ${name}`, error);
        const errorHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const errorId = 50000 + i + (errorHash % 1000);
        usedIds.add(errorId);
        
        results.push({
          name,
          profileURL: 'https://i.imgur.com/wjVuAGb.png',
          id: errorId
        });
      }
    }
    
    return results;
  }
}

export const tmdbAPI = new TMDBAPI();
export type { TMDBPerson, TMDBMovie };
