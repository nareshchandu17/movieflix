import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import WatchHistory from "@/models/WatchHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user's watch history
export async function GET(req: NextRequest) {
  try {
    // Mock user ID since authentication is removed - using valid ObjectId format
    const mockUserId = "507f1f77bcf86cd799439011";

    await connectDB();

    // Return empty array for demo since no data exists
    return NextResponse.json({ 
      history: [],
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

    const { contentId, contentType, episodeId, timestamp } = await req.json();

    if (!contentId || !contentType || timestamp === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Use upsert to update if exists, or create if new
    const updatedHistory = await WatchHistory.findOneAndUpdate(
      { userId: session.user.id, contentId },
      {
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
