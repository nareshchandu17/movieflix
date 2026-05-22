import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, action, time } = await req.json();

    if (!roomId || !action) {
      return NextResponse.json({ error: "Missing roomId or action" }, { status: 400 });
    }

    if (action === "seek" && (time === undefined || time === null)) {
      return NextResponse.json({ error: "Missing time for seek action" }, { status: 400 });
    }

    await connectDB();

    const room = await WatchPartyRoom.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can control playback
    if (room.hostId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Only host can control playback" }, { status: 403 });
    }

    const updateData: any = { lastUpdated: new Date() };
    if (action === "play") {
      updateData.currentPlayState = "playing";
    } else if (action === "pause") {
      updateData.currentPlayState = "paused";
    } else if (action === "seek") {
      updateData.currentTime = time;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await WatchPartyRoom.findByIdAndUpdate(room._id, updateData);

    // Trigger Pusher player-control event
    await triggerRoomEvent(roomId, "player-control", {
      action,
      time,
      userId: session.user.id,
      userName: session.user.name || "Host",
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party player-control error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
