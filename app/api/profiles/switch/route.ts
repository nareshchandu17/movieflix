import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clearActiveProfile } from '@/lib/active-profile-manager';
import { cookies } from 'next/headers';

// POST /api/profiles/switch - clear active profile and redirect to selection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clear active profile from backend
    await clearActiveProfile(session.user.id);

    // Clear the cookies
    const cookieStore = await cookies();
    cookieStore.delete('mf_active_profile');
    cookieStore.delete('mf_profile_secure');
    cookieStore.delete('mf_profile_kids');
    
    // We don't delete individual mf_verified_{id} here because we don't 
    // necessarily know which ones exist, but the select route will handle 
    // re-verification if needed. Clear the main ones.

    return NextResponse.json({ 
      success: true, 
      message: 'Profile switch initiated - redirecting to selection',
      redirectTo: '/profiles/select'
    });
  } catch (error: unknown) {
    console.error('POST /api/profiles/switch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to switch profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
