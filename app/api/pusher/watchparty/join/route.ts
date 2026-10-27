import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom, { MAX_WATCH_PARTY_PARTICIPANTS } from "@/features/watch-party/models/WatchPartyRoom";
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
    const { roomId, password, userName: requestedUserName } = body;

    if (typeof roomId !== "string" || !/^[A-Z0-9]{6,12}$/.test(roomId)) {
      return NextResponse.json({ error: "Invalid roomId" }, { status: 400 });
    }
    if (
      requestedUserName !== undefined &&
      (typeof requestedUserName !== "string" ||
        requestedUserName.trim().length < 1 ||
        requestedUserName.trim().length > 40)
    ) {
      return NextResponse.json({ error: "Display name must be between 1 and 40 characters" }, { status: 400 });
    }

    await connectDB();

    let room = await WatchPartyRoom.findOne({ roomId, isActive: true });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const userName = requestedUserName?.trim() || session.user.name || "Member";
    const isHost = room.hostId.toString() === userId;
    const existingParticipant = room.participants.find((p: any) => p.userId === userId);
    let joinedMessage: { id: string; userId: string; userName: string; message: string; timestamp: number; type: string } | null = null;

    if (!existingParticipant) {
      if (room.isPrivate && room.password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
      }

      const participant = {
        userId,
        userName,
        userImage: session.user.image || "",
        joinedAt: new Date(),
        isHost,
        isMuted: false,
        isVideoOff: false,
      };
      const timestamp = new Date();
      const activityMessage = {
        id: randomUUID(),
        userId: "system",
        userName: "Watch Party",
        message: `${userName} joined the party`,
        timestamp,
        type: "system",
      };

      const updatedRoom = await WatchPartyRoom.findOneAndUpdate(
        {
          _id: room._id,
          isActive: true,
          "participants.userId": { $ne: userId },
          $expr: {
            $lt: [
              { $size: { $ifNull: ["$participants", []] } },
              MAX_WATCH_PARTY_PARTICIPANTS,
            ],
          },
        },
        { $push: { participants: participant, chatHistory: { $each: [activityMessage], $slice: -500 } } },
        { new: true }
      );

      if (!updatedRoom) {
        const currentRoom = await WatchPartyRoom.findById(room._id);
        const joinedParticipant = currentRoom?.participants.find((p: any) => p.userId === userId);

        if (!currentRoom || !joinedParticipant) {
          return NextResponse.json({ error: "Room is full" }, { status: 400 });
        }

        room = await WatchPartyRoom.findOneAndUpdate(
          { _id: currentRoom._id, "participants.userId": userId },
          {
            $set: {
              "participants.$.userName": userName,
              "participants.$.userImage": session.user.image || "",
            },
          },
          { new: true }
        );
      } else {
        room = updatedRoom;
        joinedMessage = {
          ...activityMessage,
          timestamp: timestamp.getTime(),
        };
      }
    } else {
      // If participant already exists, optionally update their userName
      room = await WatchPartyRoom.findOneAndUpdate(
        { _id: room._id, "participants.userId": userId },
        {
          $set: {
            "participants.$.userName": userName,
            "participants.$.userImage": session.user.image || "",
          },
        },
        { new: true }
      );
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    let realtimeError: string | null = null;
    if (joinedMessage) {
      try {
        await WatchPartyChatMessage.create({
          roomId,
          ...joinedMessage,
          timestamp: new Date(joinedMessage.timestamp),
        });
      } catch (error) {
        console.error("Watch Party join activity persistence error:", error);
        realtimeError = "Room activity could not be fully synchronized.";
      }
      try {
        await triggerRoomEvent(roomId, "chat-message", joinedMessage);
      } catch (error) {
        console.error("Watch Party join activity delivery error:", error);
        realtimeError = "Live room activity is temporarily unavailable.";
      }
    }

    try {
      await triggerRoomEvent(roomId, "room-state", {
        hostId: room.hostId.toString(),
        participants: room.participants.map((participant: any) => ({
          userId: participant.userId,
          userName: participant.userName,
          avatarUrl: participant.userImage || "",
          isHost: room.hostId.toString() === participant.userId,
        })),
      });
    } catch (error) {
      console.error("Watch Party participant update delivery error:", error);
      realtimeError = "Live participant updates are temporarily unavailable.";
    }

    return NextResponse.json({
      roomId: room.roomId,
      movieId: room.movieId,
      playState: room.currentPlayState || "paused",
      currentTime: room.currentTime || 0,
      participants: room.participants.map((participant: any) => ({
        userId: participant.userId,
        userName: participant.userName,
        avatarUrl: participant.userImage || "",
        isHost: room.hostId.toString() === participant.userId,
      })),
      realtimeError,
    });
  } catch (error) {
    console.error("❌ Watch party room join error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
