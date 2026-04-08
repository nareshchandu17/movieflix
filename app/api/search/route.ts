import { NextRequest, NextResponse } from 'next/server';
import { smartSearch } from '@/lib/smartSearch';
import { withContentFilter } from '@/lib/contentFilterMiddleware';

async function searchHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // movie, tv, person, or multi
    const maxResults = parseInt(searchParams.get('maxResults') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Use smart search with ranking
    const results = await smartSearch(query, {
      includeMovies: type !== 'person',
      includeTV: type !== 'person',
      includePeople: type === 'person',
      maxResults
    });

    return NextResponse.json({
      success: true,
      query,
      type: type || 'multi',
      results,
      total_results: results.length,
      ranked: true, // Indicate that results are ranked
    });

  } catch (error) {
    console.error('Smart search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Export the handler with content filtering applied
export const GET = withContentFilter(searchHandler);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters = {} } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Advanced search with filters
    const searchParams = new URLSearchParams({
      query: query.trim(),
      include_adult: 'false',
      language: 'en-US',
      page: '1',
      ...filters
    });

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB API key is missing');
    }

    // Search movies with filters
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&${searchParams.toString()}`
    );

    // Search TV shows with filters
    const tvResponse = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&${searchParams.toString()}`
    );

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error('Advanced search failed');
    }

    const [movieData, tvData] = await Promise.all([
      movieResponse.json(),
      tvResponse.json()
    ]);

    return NextResponse.json({
      success: true,
      query,
      filters,
      results: {
        movies: movieData.results || [],
        tv: tvData.results || [],
        total: (movieData.results?.length || 0) + (tvData.results?.length || 0)
      }
    });

  } catch (error) {
    console.error('Advanced search API error:', error);
    return NextResponse.json(
      { 
        error: 'Advanced search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
