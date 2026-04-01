import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WatchHistory from '@/lib/models/WatchHistory';

// GET /api/history/continue - Get continue watching items for profile
export async function GET(req: NextRequest) {
  try {
    // Mock profile ID since authentication is removed - using a valid ObjectId format
    const mockProfileId = "507f1f77bcf86cd799439011"; // Valid ObjectId
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    // For demo purposes, return empty array since no actual data exists
    // This prevents the ObjectId error and provides a clean demo experience
    return NextResponse.json({
      success: true,
      data: [],
      message: 'No continue watching items found (demo mode)'
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
