import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchHistory from '@/lib/models/WatchHistory';
import { AuthManager } from '@/lib/auth-v2';
import { withProfile, validateBody } from '@/lib/auth-middleware';

// POST /api/history/progress - Update watch progress
export const POST = withProfile(
  validateBody({
    type: 'object',
    required: ['contentId', 'progress'],
    properties: {
      contentId: { type: 'string' },
      progress: { type: 'number' },
      duration: { type: 'number' },
      contentType: { type: 'string', default: 'movie' },
      sessionId: { type: 'string' },
      device: { type: 'string', default: 'web' },
      quality: { type: 'string', default: 'auto' }
  }
}), async (req: NextRequest) => {
  try {
    await connectDB();

    const { contentId, progress, duration, contentType, sessionId, device, quality } = req.validatedBody;

    // Validate input
    if (progress < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    Remove the problematic user reference

    // Calculate completion status (90% rule)
    const completed = duration && progress >= duration * 0.9;

    // Use findOneAndUpdate with upsert to prevent duplicates
    const watchHistory = await WatchHistory.findOneAndUpdate(
      { 
        profileId: req.profile.profileId, 
        contentId,
        sessionId: sessionId || undefined
      },
      {
        profileId: req.profile.profileId,
        contentId,
        contentType,
        progress: Math.min(progress, duration || progress),
        duration: duration || 0,
        completed,
        lastWatchedAt: new Date(),
        device,
        quality,
        $inc: { watchTime: 5 } // Increment watch time by 5 seconds per update
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        _id: watchHistory._id,
        contentId: watchHistory.contentId,
        progress: watchHistory.progress,
        duration: watchHistory.duration,
        completed: watchHistory.completed,
        lastWatchedAt: watchHistory.lastWatchedAt,
        watchTime: watchHistory.watchTime
      },
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Failed to update watch progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update watch progress' },
      { status: 500 }
    );
  }
}

// GET /api/history/progress - Get progress for specific content
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
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const watchHistory = await WatchHistory.findOne({
      profileId: user.profileId,
      contentId
    });

    if (!watchHistory) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No watch history found for this content'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: watchHistory._id,
        contentId: watchHistory.contentId,
        progress: watchHistory.progress,
        duration: watchHistory.duration,
        completed: watchHistory.completed,
        lastWatchedAt: watchHistory.lastWatchedAt,
        watchTime: watchHistory.watchTime,
        contentType: watchHistory.contentType
      }
    });

  } catch (error) {
    console.error('Failed to get watch progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get watch progress' },
      { status: 500 }
    );
  }
}
