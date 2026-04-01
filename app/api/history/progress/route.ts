import { NextRequest, NextResponse } from 'next/server';

// POST /api/history/progress - Update watch progress
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, progress, duration, contentType, sessionId, device, quality } = body;

    // For demo purposes, just return success without actually saving
    return NextResponse.json({
      success: true,
      message: 'Progress updated (demo mode)',
      data: {
        contentId,
        progress,
        duration,
        contentType: contentType || 'movie',
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        device: device || 'web',
        quality: quality || 'auto'
      }
    });
  } catch (error) {
    console.error('Failed to update progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// GET /api/history/progress - Get progress for specific content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'Content ID required' },
        { status: 400 }
      );
    }

    // For demo purposes, return no progress data
    return NextResponse.json({
      success: true,
      data: null,
      message: 'No progress found (demo mode)'
    });
  } catch (error) {
    console.error('Failed to get progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
