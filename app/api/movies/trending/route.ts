import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { api } from '@/lib/api';
import { withContentFilter } from '@/lib/contentFilterMiddleware';

// Original handler function
async function getTrendingMovies(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { page = '1' } = await request.json();
    const response = await api.getTrending('movie', 'week');
    
    return NextResponse.json({
      success: true,
      data: response.results,
      page: response.page,
      totalPages: response.total_pages
    });

  } catch (error: unknown) {
    console.error('Trending movies error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with content filtering
export const GET = withContentFilter(getTrendingMovies);
