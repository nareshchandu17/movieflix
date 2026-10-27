import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";

const ALLOWED_REACTIONS = new Set(["😀", "😂", "😍", "🥳", "👏", "❤️", "🍿", "🎬", "🔥", "👍"]);

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
    const { roomId, reaction, movieTimestamp } = body;

    if (
      typeof roomId !== "string" ||
      !/^[A-Z0-9]{6,12}$/.test(roomId) ||
      typeof reaction !== "string" ||
      !ALLOWED_REACTIONS.has(reaction) ||
      (movieTimestamp !== undefined &&
        (typeof movieTimestamp !== "number" || !Number.isFinite(movieTimestamp) || movieTimestamp < 0))
    ) {
      return NextResponse.json({ error: "Invalid room reaction" }, { status: 400 });
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

    await triggerRoomEvent(roomId, "reaction", {
      id: randomUUID(),
      userId: session.user.id,
      userName: participant.userName || session.user.name || "Member",
      type: reaction,
      movieTimestamp: movieTimestamp ?? 0,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party reaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
