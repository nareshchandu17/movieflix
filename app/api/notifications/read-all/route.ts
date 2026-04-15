import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import RedisManager from "@/lib/redis";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Mark all unread notifications as read for the user
    await Notification.updateMany(
      { userId: session.user.id, read: false },
      { read: true }
    );

    // 2. Invalidate cache
    const cacheKey = `notifications:unread:${session.user.id}`;
    await RedisManager.del(cacheKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications/read-all error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
