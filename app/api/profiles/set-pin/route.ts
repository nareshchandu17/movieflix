import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import bcrypt from 'bcryptjs';

// POST /api/profiles/set-pin — set or update PIN for a profile
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
    const { profileId, pin } = body;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'profileId is required' },
        { status: 400 }
      );
    }

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Validate PIN format
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify profile belongs to user
    const profile = await Profile.findOne({
      profileId,
      userId: session.user.id,
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Hash PIN with bcrypt
    const salt = await bcrypt.genSalt(12);
    const pinHash = await bcrypt.hash(pin, salt);

    // Update profile with hashed PIN
    await Profile.updateOne(
      { profileId, userId: session.user.id },
      {
        $set: {
          pin: pinHash,
          pinEnabled: true,
          pinAttempts: 0,
          pinLockedUntil: null,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'PIN set successfully',
    });

  } catch (error: unknown) {
    console.error('POST /api/profiles/set-pin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to set PIN';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
