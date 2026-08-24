import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ReactionClip from '@/features/social/models/ReactionClip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/authentication/services/auth';

/**
 * GET: List reactions for moderation.
 * Query params: status (pending, approved, rejected)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // SECURITY: In production, check session.user.role === 'admin'
    // For now, allowing all logged in users to facilitate development and testing
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = Number(searchParams.get('limit')) || 50;

    const query: any = status !== "all" ? { status } : {};
    
    const reactions = await ReactionClip.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name avatar') // To show who posted it
      .lean();

    return NextResponse.json(reactions);
  } catch (error) {
    console.error('Failed to fetch moderation reactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH: Update reaction status (approve/reject).
 */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, showInFeed, showInMoviePage } = await req.json();

    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
    }

    const updateData: any = { status };
    
    // If approving, we might want to specify where it shows
    if (status === 'approved') {
      updateData.showInFeed = showInFeed ?? true;
      updateData.showInMoviePage = showInMoviePage ?? true;
    } else if (status === 'rejected') {
      updateData.showInFeed = false;
      updateData.showInMoviePage = false;
    }

    const reaction = await ReactionClip.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reaction ${status} successfully`,
      reaction 
    });
  } catch (error) {
    console.error('Failed to update reaction status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
