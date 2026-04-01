import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { WatchProgress } from "@/lib/models/WatchProgress";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      userId,
      mediaId,
      mediaType,
      title,
      backdropPath,
      posterPath,
      timeWatched,
      totalDuration,
    } = await request.json();

    // Validate required fields
    if (!userId || !mediaId || !mediaType || !title || totalDuration === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find existing watch progress or create new one
    const watchProgress = await WatchProgress.findOneAndUpdate(
      { userId, mediaId, mediaType },
      {
        title,
        backdropPath,
        posterPath,
        timeWatched,
        totalDuration,
        lastWatchedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(watchProgress, { status: 200 });
  } catch (error) {
    console.error("Error saving watch progress:", error);
    return NextResponse.json(
      { error: "Failed to save watch progress" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get user's watch progress sorted by most recent
    const watchProgresses = await WatchProgress.find({
      userId: userId,
      // Only include items that haven't been fully watched
      $expr: { $lt: ["$timeWatched", "$totalDuration"] },
    })
      .sort({ lastWatchedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(watchProgresses, { status: 200 });
  } catch (error) {
    console.error("Error fetching watch progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch watch progress" },
      { status: 500 }
    );
  }
}
