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

    const { roomId, userName, password } = await req.json();

    if (!roomId || !userName) {
      return NextResponse.json({ error: "Missing roomId or userName" }, { status: 400 });
    }

    await connectDB();

    let room = await WatchPartyRoom.findOne({ roomId });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isHost = room.hostId.toString() === userId;
    const existingParticipant = room.participants.find((p: any) => p.userId === userId);

    if (!existingParticipant) {
      if (room.participants.length >= room.maxParticipants) {
        return NextResponse.json({ error: "Room is full" }, { status: 400 });
      }

      if (room.isPrivate && room.password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
      }

      const participant = {
        userId,
        userName,
        joinedAt: new Date(),
        isHost,
        isMuted: false,
        isVideoOff: false,
      };

      room = await WatchPartyRoom.findByIdAndUpdate(
        room._id,
        { $push: { participants: participant } },
        { new: true }
      );
    } else {
      // If participant already exists, optionally update their userName
      room = await WatchPartyRoom.findOneAndUpdate(
        { _id: room._id, "participants.userId": userId },
        { $set: { "participants.$.userName": userName } },
        { new: true }
      );
    }

    // Trigger Pusher user-joined event to notify other room members
    await triggerRoomEvent(roomId, "user-joined", {
      userId,
      userName,
      isHost,
    });

    return NextResponse.json({
      roomId: room.roomId,
      movieId: room.movieId,
      playState: room.currentPlayState || "paused",
      currentTime: room.currentTime || 0,
      participants: room.participants,
    });
  } catch (error) {
    console.error("❌ Watch party room join error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
