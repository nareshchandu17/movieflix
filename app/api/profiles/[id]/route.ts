import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import { AVATAR_MAP } from '@/lib/avatars';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/profiles/:id — edit a profile
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    const profile = await Profile.findOne({ profileId: id, userId: session.user.id });
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const allowedUpdates = ['name', 'avatarId', 'isKids', 'color', 'pin', 'maturityRating', 'language'];
    const { name, avatarId, isKids, color, pin, maturityRating, language } = body;

    // Validate name if changing
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Name must be between 2 and 20 characters' },
          { status: 400 }
        );
      }

      // Check uniqueness (skip self)
      const nameExists = await Profile.findOne({
        userId: session.user.id,
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        profileId: { $ne: id },
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Name already taken' },
          { status: 400 }
        );
      }

      profile.name = trimmedName;
    }

    // Validate avatarId if changing
    if (avatarId !== undefined) {
      if (!AVATAR_MAP[avatarId]) {
        return NextResponse.json(
          { success: false, error: 'Invalid avatar selection' },
          { status: 400 }
        );
      }
      profile.avatarId = avatarId;
    }

    if (isKids !== undefined) profile.isKids = isKids;
    if (color !== undefined) profile.color = color;
    
    // Add PIN and Maturity Rating updates
    if (pin !== undefined) {
      if (pin && !/^\d{4}$/.test(pin)) {
        return NextResponse.json(
          { success: false, error: 'PIN must be a 4-digit number' },
          { status: 400 }
        );
      }
      profile.pin = pin || null;
      profile.pinEnabled = !!pin;
    }

    if (maturityRating !== undefined) {
      const allowed = ['G', 'PG', 'PG-13', 'R', 'TV-MA'];
      if (!allowed.includes(maturityRating)) {
        return NextResponse.json(
          { success: false, error: 'Invalid maturity rating' },
          { status: 400 }
        );
      }
      profile.maturityRating = maturityRating;
    }

    if (language !== undefined) {
      profile.language = language;
    }

    await profile.save();

    const serialized = {
      ...profile.toObject(),
      _id: profile._id.toString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: unknown) {
    console.error('PATCH /api/profiles/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/:id — delete a profile
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const profile = await Profile.findOne({ profileId: id, userId: session.user.id });
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Cannot delete the only profile
    const count = await Profile.countDocuments({ userId: session.user.id });
    if (count <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your only profile' },
        { status: 400 }
      );
    }

    const wasDefault = profile.isDefault;
    await Profile.deleteOne({ _id: profile._id });

    // If deleting the default, promote the oldest remaining
    if (wasDefault) {
      const oldest = await Profile.findOne({ userId: session.user.id })
        .sort({ createdAt: 1 });
      if (oldest) {
        oldest.isDefault = true;
        await oldest.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE /api/profiles/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete profile';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
