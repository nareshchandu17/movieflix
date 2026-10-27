import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";

const typingRate = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { roomId, isTyping } = body;
    if (typeof roomId !== "string" || !/^[A-Z0-9]{6,12}$/.test(roomId) || typeof isTyping !== "boolean") {
      return NextResponse.json({ error: "Invalid typing event" }, { status: 400 });
    }

    await connectDB();
    const room = await WatchPartyRoom.findOne({
      roomId,
      isActive: true,
      "participants.userId": session.user.id,
    }).select("participants");
    const participant = room?.participants.find((entry: any) => entry.userId === session.user.id);

    if (!room || !participant) {
      return NextResponse.json({ error: "Room not found or not a participant" }, { status: 404 });
    }

    const key = `${roomId}:${session.user.id}`;
    const now = Date.now();
    typingRate.forEach((updatedAt, userKey) => {
      if (now - updatedAt > 60_000) typingRate.delete(userKey);
    });
    if (isTyping && now - (typingRate.get(key) || 0) < 400) {
      return NextResponse.json({ success: true });
    }
    if (isTyping) typingRate.set(key, now);
    else typingRate.delete(key);

    await triggerRoomEvent(roomId, "typing", {
      userId: session.user.id,
      userName: participant.userName || session.user.name || "Member",
      isTyping,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watch Party typing event error:", error);
    return NextResponse.json({ error: "Failed to send typing status" }, { status: 500 });
  }
}
