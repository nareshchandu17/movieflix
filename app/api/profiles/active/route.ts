import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveProfile, clearActiveProfile } from '@/lib/active-profile-manager';
import { cookies } from 'next/headers';

// GET /api/profiles/active - get user's active profile from backend
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activeProfile = await getActiveProfile(session.user.id);

    if (!activeProfile) {
      return NextResponse.json({ 
        success: true, 
        activeProfile: null,
        message: 'No active profile found'
      });
    }

    const serialized = {
      profileId: activeProfile.profileId,
      name: activeProfile.name,
      avatarId: activeProfile.avatarId,
      isKids: activeProfile.isKids,
      color: activeProfile.color,
      maturityRating: activeProfile.maturityRating
    };

    return NextResponse.json({ 
      success: true, 
      activeProfile: serialized 
    });
  } catch (error: unknown) {
    console.error('GET /api/profiles/active error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get active profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/active - clear user's active profile from backend
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await clearActiveProfile(session.user.id);

    // Also clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('mf_active_profile');

    return NextResponse.json({ 
      success: true, 
      message: 'Active profile cleared successfully'
    });
  } catch (error: unknown) {
    console.error('DELETE /api/profiles/active error:', error);
    const message = error instanceof Error ? error.message : 'Failed to clear active profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
