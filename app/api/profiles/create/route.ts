import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import User from '@/models/User';
import { AVATAR_MAP } from '@/lib/avatars';
import { v4 as uuidv4 } from 'uuid';

// POST /api/profiles/create — create a new profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { name, avatarId, isKids, color, language } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Profile name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 20 characters' },
        { status: 400 }
      );
    }

    // Validate avatarId
    if (!avatarId || !AVATAR_MAP[avatarId]) {
      return NextResponse.json(
        { success: false, error: 'Invalid avatar selection' },
        { status: 400 }
      );
    }

    // Check profile limit
    const userId = session.user.id;
    const user = await User.findById(userId).select('profilesLimit').lean();
    const maxProfiles = (user as Record<string, unknown>)?.profilesLimit as number || 5;
    const existingCount = await Profile.countDocuments({ userId });

    if (existingCount >= maxProfiles) {
      return NextResponse.json(
        { success: false, error: 'Maximum profiles reached' },
        { status: 400 }
      );
    }

    // Check name uniqueness for this user
    const nameExists = await Profile.findOne({
      userId,
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (nameExists) {
      return NextResponse.json(
        { success: false, error: 'Name already taken' },
        { status: 400 }
      );
    }

    // If first profile, set as default
    const isFirstProfile = existingCount === 0;

    const profile = await Profile.create({
      profileId: uuidv4(),
      userId,
      name: trimmedName,
      avatarId,
      isKids: isKids || false,
      isDefault: isFirstProfile,
      color: color || '#E50914',
      language: language || 'en-US',
    });

    const serialized = {
      ...profile.toObject(),
      _id: profile._id.toString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: serialized },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('POST /api/profiles/create error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
