import { NextRequest, NextResponse } from 'next/server';

// GET /api/history/all - Get complete watch history for profile
export async function GET(req: NextRequest) {
  try {
    // Mock user data since authentication is removed
    const mockUser = {
      userId: "507f1f77bcf86cd799439011",
      profileId: "507f1f77bcf86cd799439011"
    };

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const contentType = searchParams.get('contentType'); // movie, series, episode
    const sortBy = searchParams.get('sortBy') || 'lastWatchedAt'; // lastWatchedAt, progress, watchTime

    // For demo purposes, return empty data with proper structure
    return NextResponse.json({
      success: true,
      data: [],
      stats: {
        totalWatchTime: 0,
        completedCount: 0,
        inProgressCount: 0,
        totalCount: 0
      },
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      },
      message: 'No watch history found (demo mode)'
    });

  } catch (error) {
    console.error('Failed to fetch watch history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}

// DELETE /api/history/all - Clear watch history
export async function DELETE(req: NextRequest) {
  try {
    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      deletedCount: 0,
      message: 'Watch history cleared (demo mode)'
    });
  } catch (error) {
    console.error('Failed to clear watch history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear watch history' },
      { status: 500 }
    );
  }
}
