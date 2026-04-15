import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import bcrypt from 'bcryptjs';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

// POST /api/profiles/verify-pin - validate PIN for a profile with brute-force protection
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

    // Server-side PIN format validation
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify profile belongs to user — include lockout fields
    const profile = await Profile.findOne({
      profileId: profileId,
      userId: session.user.id,
    }).select('pin pinEnabled pinAttempts pinLockedUntil name isKids');

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if profile has PIN enabled
    if (!profile.pinEnabled || !profile.pin) {
      return NextResponse.json({
        success: true,
        valid: true,
        message: 'No PIN required for this profile'
      });
    }

    // ── Brute-force lockout check ──
    if (profile.pinLockedUntil && new Date(profile.pinLockedUntil) > new Date()) {
      const remainingMs = new Date(profile.pinLockedUntil).getTime() - Date.now();
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      return NextResponse.json(
        {
          success: false,
          error: `Profile locked. Try again in ${remainingSeconds} seconds.`,
          locked: true,
          lockedUntil: profile.pinLockedUntil.toISOString(),
          remainingSeconds,
        },
        { status: 429 }
      );
    }

    // ── Validate PIN with bcrypt ──
    const isValidPin = await bcrypt.compare(pin, profile.pin);

    if (!isValidPin) {
      // Increment attempt counter
      const newAttempts = (profile.pinAttempts || 0) + 1;
      const updateFields: Record<string, unknown> = { pinAttempts: newAttempts };

      // Lock profile if max attempts reached
      if (newAttempts >= MAX_ATTEMPTS) {
        updateFields.pinLockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        updateFields.pinAttempts = 0; // Reset counter for next lockout cycle
      }

      await Profile.updateOne(
        { profileId, userId: session.user.id },
        { $set: updateFields }
      );

      console.warn(`Failed PIN attempt (${newAttempts}/${MAX_ATTEMPTS}) for profile ${profileId} by user ${session.user.id}`);

      const attemptsRemaining = MAX_ATTEMPTS - newAttempts;

      if (newAttempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many incorrect attempts. Profile locked for 30 seconds.',
            locked: true,
            lockedUntil: updateFields.pinLockedUntil,
            remainingSeconds: 30,
            valid: false,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: attemptsRemaining <= 2
            ? `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
            : 'Incorrect PIN. Try again.',
          valid: false,
          pinRequired: true,
          attemptsRemaining,
        },
        { status: 403 }
      );
    }

    // ── Success — reset attempt counters ──
    await Profile.updateOne(
      { profileId, userId: session.user.id },
      { $set: { pinAttempts: 0, pinLockedUntil: null } }
    );

    // Set verification cookie for middleware persistence
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set(`mf_verified_${profileId}`, 'true', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours of "unlocked" state
    });

    return NextResponse.json({
      success: true,
      valid: true,
      message: 'PIN validated successfully',
      profileName: profile.name,
    });

  } catch (error: unknown) {
    console.error('POST /api/profiles/verify-pin error:', error);
    const message = error instanceof Error ? error.message : 'Failed to validate PIN';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
