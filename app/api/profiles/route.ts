import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import AccountSettings from '@/models/AccountSettings';

// GET /api/profiles — list all profiles for the session user
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const [profiles, settings] = await Promise.all([
      Profile.find({ userId: session.user.id })
        .sort({ isDefault: -1, createdAt: 1 })
        .lean(),
      AccountSettings.findOne({ userId: session.user.id }).lean()
    ]);

    const isPinProtected = !!(settings?.parentalControls?.enabled && settings?.parentalControls?.pin);

    const serialized = profiles.map((p: any) => {
      // Strip sensitive fields — never leak pin hash to frontend
      const { pin, pinAttempts, ...safe } = p;
      return {
        ...safe,
        _id: String(safe._id),
        pinEnabled: !!safe.pinEnabled,
        pinLockedUntil: safe.pinLockedUntil instanceof Date
          ? safe.pinLockedUntil.toISOString()
          : safe.pinLockedUntil || null,
        createdAt: safe.createdAt instanceof Date ? safe.createdAt.toISOString() : safe.createdAt,
        updatedAt: safe.updatedAt instanceof Date ? safe.updatedAt.toISOString() : safe.updatedAt,
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: serialized, 
      isPinProtected 
    });
  } catch (error: unknown) {
    console.error('GET /api/profiles error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
