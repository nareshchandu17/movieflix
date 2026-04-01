import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WatchCircle, WatchParty, CircleStreak } from '@/models/WatchCircle';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import type { Session } from 'next-auth';

// Extend the getServerSession return type
async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions) as Promise<Session | null>;
}

// POST /api/watchcircle/create - Create new Watch Circle
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, memberIds } = await request.json();
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Circle name is required' }, { status: 400 });
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Circle name too long (max 50 characters)' }, { status: 400 });
    }

    // Validate member count (2-6 people total including creator)
    const totalMembers = [session.user.id, ...(memberIds || [])];
    if (totalMembers.length < 2 || totalMembers.length > 6) {
      return NextResponse.json({ error: 'Watch Circle must have 2-6 members' }, { status: 400 });
    }

    // Create watch circle
    const watchCircle = new WatchCircle({
      name: name.trim(),
      members: totalMembers.map(userId => ({
        userId: new mongoose.Types.ObjectId(userId),
        joinedAt: new Date()
      })),
      createdBy: session.user.id
    });

    await watchCircle.save();

    // Initialize streak for the circle
    const existingStreak = await CircleStreak.findOne({ circleId: watchCircle._id });
    if (!existingStreak) {
      const streak = new CircleStreak({
        circleId: watchCircle._id,
        currentStreak: 0,
        longestStreak: 0,
        lastWatchDate: null
      });
      await streak.save();
    }

    // Populate members for response
    await watchCircle.populate([
      { path: 'members.userId', select: 'name email image' },
      { path: 'createdBy', select: 'name email image' }
    ]);

    return NextResponse.json({
      success: true,
      watchCircle
    });

  } catch (error: any) {
    console.error('Error creating watch circle:', error);
    return NextResponse.json({ error: 'Failed to create watch circle' }, { status: 500 });
  }
}

// GET /api/watchcircle - Get user's watch circles
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchCircles = await WatchCircle.find({
      'members.userId': session.user.id,
      isActive: true
    }).populate([
      { path: 'members.userId', select: 'name email image' },
      { path: 'createdBy', select: 'name email image' }
    ]).sort({ createdAt: -1 });

    // Get streak info for each circle
    const circlesWithStreaks = await Promise.all(
      watchCircles.map(async (circle) => {
        const streak = await CircleStreak.findOne({ circleId: circle._id });
        const activeParty = await WatchParty.findOne({
          circleId: circle._id,
          status: 'active'
        }).populate('movieId');
        
        return {
          ...circle.toObject(),
          streak: streak || { currentStreak: 0, longestStreak: 0, lastWatchDate: null },
          activeParty
        };
      })
    );

    return NextResponse.json({
      success: true,
      watchCircles: circlesWithStreaks
    });

  } catch (error: any) {
    console.error('Error fetching watch circles:', error);
    return NextResponse.json({ error: 'Failed to fetch watch circles' }, { status: 500 });
  }
}
