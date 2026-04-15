import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import RedisManager from "@/lib/redis";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // 1. Update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // 2. Invalidate unread count cache
    const cacheKey = `notifications:unread:${session.user.id}`;
    await RedisManager.del(cacheKey);

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("PATCH /api/notifications/[id]/read error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
