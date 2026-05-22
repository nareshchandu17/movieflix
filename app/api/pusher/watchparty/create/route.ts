import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/models/WatchPartyRoom";
import User from "@/models/User";

function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomName, movieId, isPrivate = false, password = "", maxParticipants = 10 } = await req.json();

    if (!roomName || !movieId) {
      return NextResponse.json({ error: "Missing roomName or movieId" }, { status: 400 });
    }

    await connectDB();

    // Generate unique room ID
    let roomId = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      roomId = generateRoomId();
      const existing = await WatchPartyRoom.findOne({ roomId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Could not generate unique room ID" }, { status: 500 });
    }

    // Create room in database
    const room = await WatchPartyRoom.create({
      roomId,
      name: roomName,
      hostId: session.user.id,
      hostName: session.user.name || "Anonymous",
      movieId,
      participants: [{
        userId: session.user.id,
        userName: session.user.name || "Anonymous",
        joinedAt: new Date(),
        isHost: true,
        isMuted: false,
        isVideoOff: false,
      }],
      isPrivate,
      password,
      maxParticipants,
      isActive: true,
      currentPlayState: "paused",
      currentTime: 0,
      createdAt: new Date(),
    });

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
