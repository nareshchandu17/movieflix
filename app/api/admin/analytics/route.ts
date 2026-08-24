import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import { connectDB } from "@/lib/db";
import User from "@/features/authentication/models/User";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import WatchHistory from "@/features/history/models/WatchHistory";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // For now, we restrict to any authenticated user. In a real production app, 
    // you would check session.user.role === 'admin' or similar.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Signups this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const signupsThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // 2. Active Watch Parties
    const activeWatchParties = await WatchPartyRoom.countDocuments({
      isActive: true
    });

    // 3. Most Watched Content
    const mostWatched = await WatchHistory.aggregate([
      {
        $group: {
          _id: "$mediaId",
          title: { $first: "$title" },
          posterPath: { $first: "$posterPath" },
          mediaType: { $first: "$mediaType" },
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    // Also get total users for some extra context
    const totalUsers = await User.countDocuments();

    return NextResponse.json({
      signupsThisWeek,
      activeWatchParties,
      mostWatched,
      totalUsers
    });

  } catch (error) {
    console.error("[admin-analytics] Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
