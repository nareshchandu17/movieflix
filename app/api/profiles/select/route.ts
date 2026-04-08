import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import { cookies } from 'next/headers';

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

    // Check PIN if profile is protected
    if (profile.pin && profile.pin !== pin) {
      return NextResponse.json(
        { success: false, error: 'Incorrect PIN', pinRequired: true },
        { status: 403 }
      );
    }

    // Set the active profile cookie
    const cookieStore = await cookies();
    cookieStore.set('mf_active_profile', profileId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const serialized = {
      profileId: profile.profileId,
      name: profile.name,
      avatarId: profile.avatarId,
      isKids: profile.isKids,
      color: profile.color,
      maturityRating: profile.maturityRating
    };

    return NextResponse.json({ success: true, profile: serialized });
  } catch (error: unknown) {
    console.error('PATCH /api/profiles/select error:', error);
    const message = error instanceof Error ? error.message : 'Failed to select profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
