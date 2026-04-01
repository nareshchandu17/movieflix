import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchHistory from '@/lib/models/WatchHistory';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                req.cookies.get('authToken')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    return {
      userId: decoded.userId,
      profileId: decoded.profileId
    };
  } catch {
    return null;
  }
}

// GET /api/history/continue - Get continue watching items for profile
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromToken(req);
    if (!user || !user.profileId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized or no profile selected' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    // Build query
    const query: any = {
      profileId: user.profileId,
      progress: { $gt: 0 } // Only show items with actual progress
    };

    if (!includeCompleted) {
      query.completed = false;
    }

    // Get continue watching items
    const items = await WatchHistory.find(query)
      .sort({ lastWatchedAt: -1 })
      .limit(Math.min(limit, 50)) // Cap at 50 items
      .lean(); // Use lean for better performance

    // Enrich with content metadata (you would typically fetch this from your content API)
    const enrichedItems = items.map(item => ({
      ...item,
      progressPercentage: item.duration > 0 ? (item.progress / item.duration) * 100 : 0,
      timeRemaining: item.duration > 0 ? Math.max(0, item.duration - item.progress) : 0,
      formattedProgress: formatTime(item.progress),
      formattedDuration: formatTime(item.duration),
      formattedTimeRemaining: formatTime(item.duration > 0 ? Math.max(0, item.duration - item.progress) : 0)
    }));

    return NextResponse.json({
      success: true,
      data: enrichedItems,
      count: enrichedItems.length,
      message: `Found ${enrichedItems.length} items to continue watching`
    });

  } catch (error) {
    console.error('Failed to get continue watching:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get continue watching' },
      { status: 500 }
    );
  }
}

// Helper function to format time in seconds to readable format
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
