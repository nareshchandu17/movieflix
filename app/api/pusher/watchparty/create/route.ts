import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom, { MAX_WATCH_PARTY_PARTICIPANTS } from "@/features/watch-party/models/WatchPartyRoom";
import User from "@/features/authentication/models/User";
import { randomInt } from "node:crypto";

function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(randomInt(chars.length));
  }
  return result;
}

function isRoomIdCollision(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error) || error.code !== 11000) {
    return false;
  }

  const duplicate = error as {
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  };
  return Boolean(
    duplicate.keyPattern?.roomId !== undefined ||
    duplicate.keyValue?.roomId !== undefined
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomName, movieId, isPrivate = false, password = "" } = await req.json();

    if (!roomName || !movieId) {
      return NextResponse.json({ error: "Missing roomName or movieId" }, { status: 400 });
    }

    await connectDB();

    let room;
    for (let attempt = 0; attempt < 10; attempt++) {
      const roomId = generateRoomId();
      try {
        room = await WatchPartyRoom.create({
          roomId,
          name: roomName,
          hostId: session.user.id,
          hostName: session.user.name || "Anonymous",
          movieId,
          participants: [{
            userId: session.user.id,
            userName: session.user.name || "Anonymous",
            userImage: session.user.image || "",
            joinedAt: new Date(),
            isHost: true,
            isMuted: false,
            isVideoOff: false,
          }],
          isPrivate,
          password,
          maxParticipants: MAX_WATCH_PARTY_PARTICIPANTS,
          isActive: true,
          currentPlayState: "paused",
          currentTime: 0,
          createdAt: new Date(),
        });
        break;
      } catch (error) {
        if (!isRoomIdCollision(error)) {
          throw error;
        }
      }
    }

    if (!room) {
      return NextResponse.json({ error: "Could not generate unique room ID" }, { status: 500 });
    }

    // Add to user's rooms
    await User.findByIdAndUpdate(session.user.id, {
      $push: { watchPartyRooms: room._id },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("❌ Watch party room creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
