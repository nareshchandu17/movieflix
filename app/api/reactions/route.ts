import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ReactionClip from "@/models/ReactionClip";

/**
 * GET /api/reactions
 * Fetch reactions for a specific movie or global feed
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movieId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    console.log(`Fetching reactions - movieId: ${movieId}, page: ${page}, limit: ${limit}`);

    const query: any = { visibility: "public" };
    if (movieId) {
      query.movieId = movieId;
    }

    const reactions = await ReactionClip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar")
      .lean();

    const total = await ReactionClip.countDocuments(query);

    console.log(`Found ${reactions.length} reactions, total: ${total}`);

    return NextResponse.json({
      success: true,
      reactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch reactions",
      reactions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      }
    }, { status: 500 });
  }
}

/**
 * POST /api/reactions
 * Create a new reaction clip
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { movieId, videoUrl, thumbnailUrl, movieTimestamp, moodEmoji, duration } = body;

    if (!movieId || !videoUrl || !thumbnailUrl || movieTimestamp === undefined || !moodEmoji || !duration) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const reaction = await ReactionClip.create({
      userId: (session.user as any).id,
      movieId,
      videoUrl,
      thumbnailUrl,
      movieTimestamp,
      moodEmoji,
      duration,
      visibility: "public",
    });

    return NextResponse.json({ success: true, reaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating reaction:", error);
    return NextResponse.json({ success: false, error: "Failed to create reaction" }, { status: 500 });
  }
}
