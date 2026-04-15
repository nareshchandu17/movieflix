import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLastUsedProfile } from '@/lib/active-profile-manager';

// GET /api/profiles/last-used - get user's last used profile for session sync
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const lastUsedProfile = await getLastUsedProfile(session.user.id);

    if (!lastUsedProfile) {
      return NextResponse.json({ 
        success: true, 
        lastUsedProfile: null,
        message: 'No last used profile found'
      });
    }

    const serialized = {
      profileId: lastUsedProfile.profileId,
      name: lastUsedProfile.name,
      avatarId: lastUsedProfile.avatarId,
      isKids: lastUsedProfile.isKids,
      color: lastUsedProfile.color,
      maturityRating: lastUsedProfile.maturityRating
    };

    return NextResponse.json({ 
      success: true, 
      lastUsedProfile: serialized 
    });
  } catch (error: unknown) {
    console.error('GET /api/profiles/last-used error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get last used profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
