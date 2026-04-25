import { NextRequest, NextResponse } from 'next/server';
import { smartSearch, normalizeQuery } from '@/lib/smartSearch';
import { withContentFilter } from '@/lib/contentFilterMiddleware';

/**
 * Keyword Search API
 */
async function searchHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || "";
    const query = normalizeQuery(rawQuery);

    if (query.length === 0) {
      return NextResponse.json({
        success: true,
        topMatch: null,
        movies: [],
        tv: [],
        people: [],
        results: [],
        message: "Start typing to search"
      });
    }

    const result = await smartSearch(query);

    return NextResponse.json({
      success: true,
      ...result
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ 
      success: false,
      topMatch: null, 
      movies: [], 
      tv: [], 
      people: [], 
      results: [],
      error: "Something went wrong" 
    }, { status: 500 });
  }
}

export const GET = withContentFilter(searchHandler);

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
