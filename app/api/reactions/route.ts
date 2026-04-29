import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ReactionClip from '@/models/ReactionClip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET: Fetch reactions for a movie or the global feed.
 * Unified to use ReactionClip model.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const movieId = searchParams.get('movieId');
    const limit = Number(searchParams.get('limit')) || 20;

    let query: any = {};
    
    if (type === 'mine') {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json([], { status: 200 });
      
      const userId = (session.user as any).id;
      query = { userId }; // User always sees all their own reactions
    } else if (movieId) {
      query.movieId = movieId.toString();
      query.showInMoviePage = true;
      query.status = 'approved';
    } else {
      // Default to global feed
      query.showInFeed = true;
      query.status = 'approved';
    }

    const reactions = await ReactionClip.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Map fields for backward compatibility with ReelsPlayer interface
    const mappedReactions = reactions.map(r => ({
      ...r,
      _id: r._id.toString(),
      likes: (r as any).likesCount || 0,
      views: (r as any).viewsCount || 0,
    }));

    return NextResponse.json(mappedReactions);
  } catch (error) {
    console.error('Failed to fetch reactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Remove a reaction.
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing reaction ID' }, { status: 400 });
    }

    const reaction = await ReactionClip.findOneAndDelete({ _id: id, userId });

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    console.error('Failed to delete reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
