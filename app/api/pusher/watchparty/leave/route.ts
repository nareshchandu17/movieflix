import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";
import { randomUUID } from "node:crypto";
import WatchPartyChatMessage from "@/features/watch-party/models/WatchPartyChatMessage";

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
    const { roomId } = body;

    if (typeof roomId !== "string" || !/^[A-Z0-9]{6,12}$/.test(roomId)) {
      return NextResponse.json({ error: "Invalid roomId" }, { status: 400 });
    }

    await connectDB();

    const userId = session.user.id;

    const participantRoom = await WatchPartyRoom.findOne({
      roomId,
      isActive: true,
      "participants.userId": userId,
    }).select("participants");
    const participant = participantRoom?.participants.find((entry: any) => entry.userId === userId);
    if (!participantRoom || !participant) {
      return NextResponse.json({ success: true });
    }

    const timestamp = new Date();
    const activityMessage = {
      id: randomUUID(),
      userId: "system",
      userName: "Watch Party",
      message: `${participant.userName || session.user.name || "A participant"} left the party`,
      timestamp,
      type: "system",
    };
    const room = await WatchPartyRoom.findOneAndUpdate(
      { _id: participantRoom._id, "participants.userId": userId },
      {
        $pull: { participants: { userId } },
        $push: { chatHistory: { $each: [activityMessage], $slice: -500 } },
      },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    let realtimeError: string | null = null;
    try {
      await WatchPartyChatMessage.create({
        roomId,
        ...activityMessage,
      });
    } catch (error) {
      console.error("Watch Party leave activity persistence error:", error);
      realtimeError = "Room activity could not be fully synchronized.";
    }

    try {
      await triggerRoomEvent(roomId, "chat-message", {
        ...activityMessage,
        timestamp: timestamp.getTime(),
      });
    } catch (error) {
      console.error("Watch Party leave activity delivery error:", error);
      realtimeError = "Live room activity is temporarily unavailable.";
    }

    try {
      await triggerRoomEvent(roomId, "room-state", {
        hostId: room.hostId.toString(),
        participants: room.participants.map((p: any) => ({
          userId: p.userId,
          userName: p.userName,
          avatarUrl: p.userImage || "",
          isHost: room.hostId.toString() === p.userId,
        })),
      });
    } catch (error) {
      console.error("Watch Party participant update delivery error:", error);
      realtimeError = "Live participant updates are temporarily unavailable.";
    }

    // If no participants left, we can mark the room as inactive
    if (room.participants.length === 0) {
      await WatchPartyRoom.findByIdAndUpdate(room._id, { isActive: false });
    }

    return NextResponse.json({ success: true, realtimeError });
  } catch (error) {
    console.error("❌ Watch party room leave error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
