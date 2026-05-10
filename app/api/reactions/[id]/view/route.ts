import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ReactionClip from '@/models/ReactionClip';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    // Unified to use ReactionClip and viewsCount field
    const reaction = await ReactionClip.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    return NextResponse.json({ views: reaction.viewsCount });
  } catch (error) {
    console.error('Failed to view reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
