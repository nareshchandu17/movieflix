import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'Server misconfiguration: TMDB_API_KEY is missing' },
        { status: 500 }
      );
    }

    // Join the path segments
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // Forward all query parameters
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    
    // Enforce server-side API Key
    searchParams.set('api_key', TMDB_API_KEY);
    
    const tmdbUrl = `${TMDB_BASE_URL}/${path}?${searchParams.toString()}`;
    
    let response;
    let retries = 3;
    let delay = 500;
    
    while (retries > 0) {
      try {
        response = await fetch(tmdbUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MovieFlix-NextJS-Proxy',
          },
          cache: 'no-store'
        });
        
        // If successful or it's a regular HTTP error (not a network abort), break the retry loop
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) throw err;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: 'TMDB API error', status: response?.status || 500 },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
      }
    });

  } catch (error) {
    console.error('[TMDB Proxy Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
