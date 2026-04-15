import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import bcrypt from 'bcryptjs';

// POST /api/profiles/remove-pin — remove PIN protection from a profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { profileId, currentPin } = body;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify profile belongs to user
    const profile = await Profile.findOne({
      profileId,
      userId: session.user.id,
    }).select('pin pinEnabled');

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // If PIN is currently enabled, require currentPin to remove it (security)
    if (profile.pinEnabled && profile.pin) {
      if (!currentPin || typeof currentPin !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Current PIN is required to remove PIN protection' },
          { status: 400 }
        );
      }

      const isValidPin = await bcrypt.compare(currentPin, profile.pin);
      if (!isValidPin) {
        return NextResponse.json(
          { success: false, error: 'Incorrect current PIN' },
          { status: 403 }
        );
      }
    }

    // Remove PIN protection
    await Profile.updateOne(
      { profileId, userId: session.user.id },
      {
        $set: {
          pin: null,
          pinEnabled: false,
          pinAttempts: 0,
          pinLockedUntil: null,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'PIN removed successfully',
    });

  } catch (error: unknown) {
    console.error('POST /api/profiles/remove-pin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove PIN';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
