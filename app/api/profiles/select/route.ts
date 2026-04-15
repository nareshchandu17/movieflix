import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import { setActiveProfile } from '@/lib/active-profile-manager';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// PATCH /api/profiles/select — set the active profile cookie
export async function PATCH(req: NextRequest) {
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

    await connectDB();

    // Verify this profile belongs to the user
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

    // Check PIN if profile is protected (server-side validation only)
    if (profile.pinEnabled && profile.pin) {
      // Check lockout first
      if (profile.pinLockedUntil && new Date(profile.pinLockedUntil) > new Date()) {
        const remainingMs = new Date(profile.pinLockedUntil).getTime() - Date.now();
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return NextResponse.json(
          { success: false, error: `Profile locked. Try again in ${remainingSeconds} seconds.`, pinRequired: true, locked: true },
          { status: 429 }
        );
      }

      if (!pin) {
        return NextResponse.json(
          { success: false, error: 'PIN required for this profile', pinRequired: true },
          { status: 403 }
        );
      }
      
      // Validate PIN with bcrypt (secure server-side validation)
      const isValidPin = await bcrypt.compare(pin, profile.pin);
      
      if (!isValidPin) {
        console.warn(`Failed PIN attempt for profile ${profileId} by user ${session.user.id}`);
        
        return NextResponse.json(
          { success: false, error: 'Incorrect PIN', pinRequired: true },
          { status: 403 }
        );
      }

      // Reset attempts on successful PIN entry via select
      await Profile.updateOne(
        { profileId, userId: session.user.id },
        { $set: { pinAttempts: 0, pinLockedUntil: null } }
      );
    }

    // Store active profile in backend (source of truth)
    await setActiveProfile(session.user.id, profileId);

    // Set cookies for middleware and client access
    const cookieStore = await cookies();
    
    // 1. Core Active Profile Cookie
    cookieStore.set('mf_active_profile', profileId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 2. PIN Requirement Flag (for middleware to know if it should check for verification)
    if (profile.pinEnabled && profile.pin) {
      cookieStore.set('mf_profile_secure', 'true', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      // Clear verification if switching TO a PIN-protected profile (must re-verify)
      cookieStore.delete(`mf_verified_${profileId}`);
    } else {
      cookieStore.set('mf_profile_secure', 'false', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      // Auto-verify if no PIN is required
      cookieStore.set(`mf_verified_${profileId}`, 'true', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    const serialized = {
      profileId: profile.profileId,
      name: profile.name,
      avatarId: profile.avatarId,
      isKids: profile.isKids,
      color: profile.color,
      maturityRating: profile.maturityRating
    };

    return NextResponse.json({ 
      success: true, 
      profile: serialized,
      message: 'Profile selected successfully'
    });
  } catch (error: unknown) {
    console.error('PATCH /api/profiles/select error:', error);
    const message = error instanceof Error ? error.message : 'Failed to select profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
