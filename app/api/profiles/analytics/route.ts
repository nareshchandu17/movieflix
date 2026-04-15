import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ProfileAnalytics from '@/models/ProfileAnalytics';
import WatchHistory from '@/models/WatchHistory';

// GET /api/profiles/analytics/:profileId - get analytics for a specific profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { profileId } = await params;

    // Get or create analytics for this profile
    let analytics = await ProfileAnalytics.findOne({ 
      userId: session.user.id, 
      profileId 
    });

    if (!analytics) {
      // Create initial analytics from watch history
      analytics = await initializeAnalytics(session.user.id, profileId);
    }

    // Calculate weekly and monthly stats
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentHistory = await WatchHistory.find({
      userId: session.user.id,
      profileId,
      createdAt: { $gte: monthStart }
    }).lean();

    const weeklyHistory = recentHistory.filter(item => 
      new Date(item.createdAt) >= weekStart
    );

    const weeklyWatchTime = weeklyHistory.reduce((sum, item) => 
      sum + (item.duration || 0), 0
    ) / 60; // Convert to minutes

    const monthlyWatchTime = recentHistory.reduce((sum, item) => 
      sum + (item.duration || 0), 0
    ) / 60; // Convert to minutes

    // Update analytics with current period data
    analytics.weeklyWatchTime = weeklyWatchTime;
    analytics.monthlyWatchTime = monthlyWatchTime;
    analytics.lastActiveAt = new Date();

    await analytics.save();

    return NextResponse.json({
      success: true,
      data: {
        ...analytics.toObject(),
        weeklyWatchTime,
        monthlyWatchTime,
        insights: generateInsights(analytics.toObject())
      }
    });

  } catch (error: unknown) {
    console.error('GET /api/profiles/analytics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/profiles/analytics/:profileId - update analytics
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { profileId } = await params;
    const body = await req.json();

    const analytics = await ProfileAnalytics.findOneAndUpdate(
      { userId: session.user.id, profileId },
      { 
        ...body,
        lastActiveAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error: unknown) {
    console.error('POST /api/profiles/analytics error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Helper function to initialize analytics from watch history
async function initializeAnalytics(userId: string, profileId: string) {
  const history = await WatchHistory.find({ userId, profileId }).lean();
  
  const totalWatchTime = history.reduce((sum, item) => sum + (item.duration || 0), 0) / 60;
  const moviesWatched = history.filter(item => item.contentType === 'movie').length;
  const seriesWatched = history.filter(item => item.contentType === 'series').length;
  const episodesWatched = history.filter(item => item.contentType === 'episode').length;
  
  const averageSessionDuration = history.length > 0 
    ? totalWatchTime / history.length 
    : 0;

  // Analyze watch patterns
  const hourCounts: { [key: string]: number } = {};
  history.forEach(item => {
    const hour = new Date(item.lastWatchedAt).getHours();
    const timeOfDay = getTimeOfDay(hour);
    hourCounts[timeOfDay] = (hourCounts[timeOfDay] || 0) + 1;
  });

  const mostWatchedTimeOfDay = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'evening';

  return await ProfileAnalytics.create({
    profileId,
    userId,
    totalWatchTime,
    moviesWatched,
    seriesWatched,
    episodesWatched,
    averageSessionDuration,
    mostWatchedTimeOfDay,
    lastActiveAt: new Date(),
    weeklyWatchTime: 0,
    monthlyWatchTime: 0,
    favoriteActors: [],
    favoriteDirectors: [],
    contentPreferences: {
      genres: {},
      ratings: {},
      decades: {}
    }
  });
}

// Helper function to get time of day
function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Helper function to generate insights
function generateInsights(analytics: any) {
  const insights: string[] = [];

  if (analytics.totalWatchTime > 10000) {
    insights.push('🎬 Power Viewer - Watched over 160 hours of content!');
  }

  if (analytics.averageSessionDuration > 90) {
    insights.push('🍿 Binge Watcher - Average session over 90 minutes');
  }

  if (analytics.seriesWatched > analytics.moviesWatched * 2) {
    insights.push('📺 Series Fan - Prefers series over movies');
  }

  if (analytics.mostWatchedTimeOfDay === 'night') {
    insights.push('🌙 Night Owl - Most active during late hours');
  }

  return insights;
}
