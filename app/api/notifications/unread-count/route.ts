import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import RedisManager from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `notifications:unread:${userId}`;

    // 1. Try to get from Redis cache
    let unreadCount = await RedisManager.get(cacheKey);

    if (unreadCount === null) {
      // 2. Cache miss: Fetch from MongoDB
      await connectDB();
      unreadCount = await Notification.countDocuments({
        userId,
        read: false,
      });

      // 3. Store in Redis for 1 hour (or until invalidated by worker)
      await RedisManager.set(cacheKey, unreadCount, 3600);
    }

    return NextResponse.json({
      unreadCount: parseInt(unreadCount),
    });
  } catch (error) {
    console.error("GET /api/notifications/unread-count error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
