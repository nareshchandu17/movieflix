import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerSignalEvent } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { roomId, targetUserId, type, offer, answer, candidate } = body;

    if (
      typeof roomId !== "string" ||
      !/^[A-Z0-9]{6,12}$/.test(roomId) ||
      typeof targetUserId !== "string" ||
      !["offer", "answer", "ice-candidate"].includes(type)
    ) {
      return NextResponse.json({ error: "Invalid signaling request" }, { status: 400 });
    }
    if (JSON.stringify({ offer, answer, candidate }).length > 64_000) {
      return NextResponse.json({ error: "Signaling payload is too large" }, { status: 413 });
    }
    const signalValue = type === "offer" ? offer : type === "answer" ? answer : candidate;
    if (!signalValue || typeof signalValue !== "object" || Array.isArray(signalValue)) {
      return NextResponse.json({ error: "Missing signaling data" }, { status: 400 });
    }

    await connectDB();

    const room = await WatchPartyRoom.findOne({ roomId, isActive: true });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify sender is a participant in this room
    const isParticipant = room.participants.some((p: any) => p.userId === session.user.id);
    const targetIsParticipant = room.participants.some((p: any) => p.userId === targetUserId);
    if (!isParticipant || !targetIsParticipant) {
      return NextResponse.json({ error: "Both users must be active room participants" }, { status: 403 });
    }

    // Trigger signaling event to target user via private signal channel
    await triggerSignalEvent(targetUserId, "signaling", {
      type,
      offer,
      answer,
      candidate,
      senderId: session.user.id,
      senderName: session.user.name || "Member",
      roomId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party WebRTC signaling error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
