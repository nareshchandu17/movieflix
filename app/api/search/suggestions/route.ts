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
  "dwayne johnson"
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({
        success: true,
        suggestions: []
      });
    }

    // Generate autocomplete suggestions based on query
    const suggestions = TRENDING_SEARCHES
      .filter(search => search.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(search => ({
        id: `suggestion-${search}`,
        text: search,
        category: 'mixed' // Could be enhanced to detect movie/tv/person
      }));

    return NextResponse.json({
      success: true,
      query,
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate suggestions',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
