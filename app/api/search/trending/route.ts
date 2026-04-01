import { NextRequest, NextResponse } from 'next/server';

// Mock trending searches - in a real app, this would come from analytics
const TRENDING_SEARCHES = [
  "action movies",
  "comedy movies", 
  "horror movies",
  "marvel",
  "dc comics",
  "netflix series",
  "christopher nolan",
  "scarlett johansson",
  "tom cruise",
  "dwayne johnson",
  "thriller movies",
  "romance movies",
  "sci-fi movies",
  "disney movies",
  "anime series"
];

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Query your analytics database for most popular searches
    // 2. Use trending API endpoints from TMDB
    // 3. Cache results for performance
    
    return NextResponse.json({
      success: true,
      trending: TRENDING_SEARCHES,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trending searches API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending searches',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
