import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Reaction } from '@/models/Reaction';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Simplest MVP implementation: Just increment the likes counter.
    // In a real production app, we'd check if the user already liked it in a separate ReactionLike collection
    const reaction = await Reaction.findByIdAndUpdate(
      params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: reaction.likes });
  } catch (error) {
    console.error('Failed to like reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
