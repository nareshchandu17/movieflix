import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WatchParty, CircleStreak, WatchSession } from '@/models/WatchCircle';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import type { Session } from 'next-auth';

// POST /api/watchparty/create - Create new watch party
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { circleId, movieId, movieTitle, moviePoster } = await request.json();
    
    if (!circleId || !movieId || !movieTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique room code
    const roomCode = generateRoomCode();
    
    // Create watch party
    const watchParty = new WatchParty({
      circleId: new mongoose.Types.ObjectId(circleId),
      movieId,
      movieTitle,
      moviePoster: moviePoster || '',
      hostId: session.user.id,
      participants: [{
        userId: session.user.id,
        joinedAt: new Date(),
        watchDuration: 0,
        completed: false
      }],
      roomCode,
      status: 'active'
    });

    await watchParty.save();

    return NextResponse.json({
      success: true,
      watchParty: {
        ...watchParty.toObject(),
        roomCode
      }
    });

  } catch (error: any) {
    console.error('Error creating watch party:', error);
    return NextResponse.json({ error: 'Failed to create watch party' }, { status: 500 });
  }
}

// POST /api/watchparty/join - Join existing watch party
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomCode } = await request.json();
    
    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    // Find active watch party
    const watchParty = await WatchParty.findOne({
      roomCode,
      status: 'active'
    }).populate('circleId');

    if (!watchParty) {
      return NextResponse.json({ error: 'Watch party not found or not active' }, { status: 404 });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = watchParty.participants.some(
      (p: any) => p.userId.toString() === session.user.id
    );

    if (isAlreadyParticipant) {
      return NextResponse.json({ error: 'Already joined this watch party' }, { status: 400 });
    }

    // Check if user is member of the circle
    const isCircleMember = watchParty.circleId.members.some(
      (m: any) => m.userId.toString() === session.user.id
    );

    if (!isCircleMember) {
      return NextResponse.json({ error: 'Not a member of this watch circle' }, { status: 403 });
    }

    // Add user as participant
    watchParty.participants.push({
      userId: session.user.id,
      joinedAt: new Date(),
      watchDuration: 0,
      completed: false
    });

    await watchParty.save();

    return NextResponse.json({
      success: true,
      watchParty
    });

  } catch (error: any) {
    console.error('Error joining watch party:', error);
    return NextResponse.json({ error: 'Failed to join watch party' }, { status: 500 });
  }
}

// POST /api/watchparty/complete - Mark watch session as complete
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { watchPartyId, duration, completed } = await request.json();
    
    if (!watchPartyId) {
      return NextResponse.json({ error: 'Watch party ID is required' }, { status: 400 });
    }

    // Find watch party
    const watchParty = await WatchParty.findById(watchPartyId);
    if (!watchParty) {
      return NextResponse.json({ error: 'Watch party not found' }, { status: 404 });
    }

    // Update participant's watch duration
    const participant = watchParty.participants.find(
      (p: any) => p.userId.toString() === session.user.id
    );

    if (participant) {
      participant.watchDuration = (participant.watchDuration || 0) + (duration || 0);
      participant.completed = completed || participant.completed;
    }

    // If party is completed, update status
    const allCompleted = watchParty.participants.every((p: any) => p.completed);
    if (allCompleted) {
      watchParty.status = 'completed';
      watchParty.endTime = new Date();
    }

    await watchParty.save();

    // Create watch session
    const watchSession = new WatchSession({
      userId: session.user.id,
      circleId: watchParty.circleId,
      watchPartyId: watchParty._id,
      duration: duration || 0,
      completed: completed || false,
      watchDate: new Date()
    });

    await watchSession.save();

    // Update streak if completed (>= 30 minutes or completed movie)
    if ((duration >= 30 || completed) && participant) {
      await updateStreak(watchParty.circleId);
    }

    return NextResponse.json({
      success: true,
      watchParty,
      streakUpdated: duration >= 30 || completed
    });

  } catch (error: any) {
    console.error('Error completing watch session:', error);
    return NextResponse.json({ error: 'Failed to complete watch session' }, { status: 500 });
  }
}

// GET /api/watchparty/[roomCode] - Get watch party details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomCode } = await params;
    
    const watchParty = await WatchParty.findOne({
      roomCode,
      status: 'active'
    }).populate([
      { path: 'circleId' },
      { path: 'participants.userId', select: 'name email image' }
    ]);

    if (!watchParty) {
      return NextResponse.json({ error: 'Watch party not found' }, { status: 404 });
    }

    // Check if user is member of the circle
    const isCircleMember = watchParty.circleId.members.some(
      (m: any) => m.userId.toString() === session.user.id
    );

    if (!isCircleMember) {
      return NextResponse.json({ error: 'Not authorized to join this watch party' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      watchParty
    });

  } catch (error: any) {
    console.error('Error fetching watch party:', error);
    return NextResponse.json({ error: 'Failed to fetch watch party' }, { status: 500 });
  }
}

// Helper function to generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to update streak
async function updateStreak(circleId: any) {
  try {
    const streak = await CircleStreak.findOne({ circleId });
    
    if (!streak) {
      // Create new streak if doesn't exist
      const newStreak = new CircleStreak({
        circleId,
        currentStreak: 1,
        longestStreak: 1,
        lastWatchDate: new Date(),
        weeklyWatchCount: 1,
        totalWatchSessions: 1
      });
      await newStreak.save();
      return;
    }

    const now = new Date();
    const lastWatch = streak.lastWatchDate;
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check if watched this week
    if (lastWatch && lastWatch > oneWeekAgo) {
      // Same week - increment weekly count
      streak.weeklyWatchCount += 1;
    } else {
      // New week - reset weekly count, increment streak
      streak.currentStreak += 1;
      streak.weeklyWatchCount = 1;
    }

    streak.lastWatchDate = now;
    streak.totalWatchSessions += 1;

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    await streak.save();

  } catch (error) {
    console.error('Error updating streak:', error);
  }
}
