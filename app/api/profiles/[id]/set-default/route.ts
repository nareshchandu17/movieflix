import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/profiles/[id]/set-default - set a profile as default
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    // Verify profile belongs to user
    const profile = await Profile.findOne({
      profileId: id,
      userId: session.user.id,
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Clear existing default flag for all user profiles
    await Profile.updateMany(
      { userId: session.user.id },
      { isDefault: false }
    );

    // Set new default
    await Profile.updateOne(
      { profileId: id },
      { isDefault: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile set as default successfully'
    });
  } catch (error: unknown) {
    console.error('PATCH /api/profiles/[id]/set-default error:', error);
    const message = error instanceof Error ? error.message : 'Failed to set default profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
