import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/models/WatchPartyRoom";
import { triggerSignalEvent } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, targetUserId, type, sdp, candidate } = await req.json();

    if (!roomId || !targetUserId || !type) {
      return NextResponse.json({ error: "Missing roomId, targetUserId, or type" }, { status: 400 });
    }

    await connectDB();

    const room = await WatchPartyRoom.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify sender is a participant in this room
    const isParticipant = room.participants.some((p: any) => p.userId === session.user.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden: You are not in this Watch Party room" }, { status: 403 });
    }

    // Trigger signaling event to target user via private signal channel
    await triggerSignalEvent(targetUserId, "signaling", {
      type,
      sdp,
      candidate,
      senderId: session.user.id,
      senderName: session.user.name || "User",
      roomId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party WebRTC signaling error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
