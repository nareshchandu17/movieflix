import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WatchHistory from "@/models/WatchHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's watch history for the active profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const profileId = cookieStore.get('mf_active_profile')?.value;

    if (!profileId) {
      return NextResponse.json({ message: "No active profile" }, { status: 400 });
    }

    await connectDB();

    const history = await WatchHistory.find({ 
      userId: session.user.id,
      profileId 
    }).sort({ lastWatched: -1 }).limit(20);

    return NextResponse.json({ 
      history,
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ message: "Failed to fetch history" }, { status: 500 });
  }
}

// POST update watch history timestamp
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const profileId = cookieStore.get('mf_active_profile')?.value;

    if (!profileId) {
      return NextResponse.json({ message: "No active profile" }, { status: 400 });
    }

    const { contentId, contentType, episodeId, timestamp } = await req.json();

    if (!contentId || !contentType || timestamp === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Use upsert to update if exists, or create if new
    const updatedHistory = await WatchHistory.findOneAndUpdate(
      { profileId, contentId },
      {
        userId: session.user.id,
        contentType,
        episodeId,
        timestamp,
        lastWatched: new Date()
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "History updated", item: updatedHistory }, { status: 200 });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ message: "Failed to update history" }, { status: 500 });
  }
}
