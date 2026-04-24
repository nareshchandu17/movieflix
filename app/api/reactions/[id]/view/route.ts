import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Reaction } from '@/models/Reaction';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // MVP: increment views
    const reaction = await Reaction.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!reaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    return NextResponse.json({ views: reaction.views });
  } catch (error) {
    console.error('Failed to view reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
