import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";

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
    const { roomId, action, time } = body;

    if (
      typeof roomId !== "string" ||
      !/^[A-Z0-9]{6,12}$/.test(roomId) ||
      !["play", "pause", "seek"].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid room control request" }, { status: 400 });
    }

    if (
      (action === "seek" && (typeof time !== "number" || !Number.isFinite(time) || time < 0)) ||
      (time !== undefined && (typeof time !== "number" || !Number.isFinite(time) || time < 0))
    ) {
      return NextResponse.json({ error: "Invalid playback time" }, { status: 400 });
    }

    await connectDB();

    const room = await WatchPartyRoom.findOne({
      roomId,
      isActive: true,
      "participants.userId": session.user.id,
    });
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

    const updatedRoom = await WatchPartyRoom.findOneAndUpdate(
      {
        _id: room._id,
        isActive: true,
        hostId: session.user.id,
        "participants.userId": session.user.id,
      },
      updateData,
      { new: true }
    );
    if (!updatedRoom) {
      return NextResponse.json({ error: "You are no longer an active room host" }, { status: 403 });
    }

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
