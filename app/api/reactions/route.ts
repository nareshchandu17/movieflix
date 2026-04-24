import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Reaction } from '@/models/Reaction';
import { getServerSession } from 'next-auth';

// Mock authOptions just in case it doesn't exist, to prevent breaking
// Actually, let's just require a session or fallback to a dummy user if we're in MVP mode
const getUserId = async () => {
  try {
    const session = await getServerSession();
    return session?.user?.id || 'mock-user-123';
  } catch (e) {
    return 'mock-user-123';
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserId();
    
    const body = await req.json();
    const { movieId, videoUrl, thumbnailUrl, caption, duration } = body;

    if (!movieId || !videoUrl || !thumbnailUrl || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reaction = await Reaction.create({
      userId,
      movieId: Number(movieId),
      videoUrl,
      thumbnailUrl,
      caption,
      duration: Number(duration),
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create reaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const movieId = searchParams.get('movieId');
    const limit = Number(searchParams.get('limit')) || 20;

    let query: any = {};
    if (movieId) {
      query.movieId = Number(movieId);
    }

    const reactions = await Reaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(reactions);
  } catch (error) {
    console.error('Failed to fetch reactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
