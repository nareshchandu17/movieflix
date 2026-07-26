import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, message } = await req.json();

    if (!roomId || !message || message.trim() === "") {
      return NextResponse.json({ error: "Missing roomId or empty message" }, { status: 400 });
    }

    await connectDB();

    const room = await WatchPartyRoom.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const msgId = crypto.randomUUID();
    const chatMessagePayload = {
      id: msgId,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      message: message,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    // Save to DB
    await WatchPartyRoom.findByIdAndUpdate(room._id, {
      $push: {
        chatHistory: {
          id: chatMessagePayload.id,
          userId: chatMessagePayload.userId,
          userName: chatMessagePayload.userName,
          message: chatMessagePayload.message,
          timestamp: new Date(chatMessagePayload.timestamp),
          type: chatMessagePayload.type,
        },
      },
    });

    // Trigger Pusher chat-message event
    await triggerRoomEvent(roomId, "chat-message", chatMessagePayload);

    return NextResponse.json({ success: true, message: chatMessagePayload });
  } catch (error) {
    console.error("❌ Watch party chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
