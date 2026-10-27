import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import WatchPartyChatMessage from "@/features/watch-party/models/WatchPartyChatMessage";
import WatchPartyMessageRateLimit from "@/features/watch-party/models/WatchPartyMessageRateLimit";
import { triggerRoomEvent } from "@/lib/pusher/server";

const MESSAGE_LIMIT = 2000;
const HISTORY_PAGE_SIZE = 50;
const RATE_LIMIT_COUNT = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && /^[A-Z0-9]{6,12}$/.test(roomId);
}

function formatMessage(entry: any) {
  return {
    id: entry.id,
    userId: entry.userId,
    userName: entry.userName,
    avatarUrl: entry.avatarUrl || "",
    message: entry.message,
    timestamp: new Date(entry.timestamp).getTime(),
    type: entry.type === "system" ? "system" : "text",
  };
}

async function consumeMessageQuota(roomId: string, userId: string): Promise<boolean> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS);
  const filter = { roomId, userId, windowStart };
  let quota;

  try {
    quota = await WatchPartyMessageRateLimit.findOneAndUpdate(
      filter,
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    quota = await WatchPartyMessageRateLimit.findOneAndUpdate(
      filter,
      { $inc: { count: 1 } },
      { new: true }
    );
  }

  return Boolean(quota && quota.count <= RATE_LIMIT_COUNT);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const beforeParam = searchParams.get("before");
    const beforeId = searchParams.get("beforeId");
    const requestedLimit = Number(searchParams.get("limit") || HISTORY_PAGE_SIZE);
    const limit = Number.isInteger(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, HISTORY_PAGE_SIZE))
      : HISTORY_PAGE_SIZE;
    const before = beforeParam ? Number(beforeParam) : null;

    if (
      !isValidRoomId(roomId) ||
      (beforeParam &&
        (!Number.isFinite(before) || before! < 0 || !beforeId || beforeId.length > 64))
    ) {
      return NextResponse.json({ error: "Invalid room or history cursor" }, { status: 400 });
    }

    await connectDB();
    const room = await WatchPartyRoom.findOne({
      roomId,
      isActive: true,
      "participants.userId": session.user.id,
    }).select("chatHistory");

    if (!room) {
      return NextResponse.json({ error: "Room not found or not a participant" }, { status: 404 });
    }

    const cursorDate = before ? new Date(before) : null;
    const cursorFilter = cursorDate
      ? {
          $or: [
            { timestamp: { $lt: cursorDate } },
            { timestamp: cursorDate, id: { $lt: beforeId } },
          ],
        }
      : {};
    const persistedMessages = await WatchPartyChatMessage.find({
      roomId,
      ...cursorFilter,
    })
      .sort({ timestamp: -1, id: -1 })
      .limit(limit + 1)
      .lean();

    const legacyMessages = room.chatHistory.filter((entry: any) => {
      if (!cursorDate) return true;
      const timestamp = new Date(entry.timestamp).getTime();
      return timestamp < before! || (timestamp === before && entry.id < beforeId!);
    });
    const byId = new Map<string, any>();
    legacyMessages.forEach((entry: any) => byId.set(entry.id, entry));
    persistedMessages.forEach((entry: any) => byId.set(entry.id, entry));

    const sorted = [...byId.values()].sort((left: any, right: any) => {
      const timeDifference =
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
      return timeDifference || String(right.id).localeCompare(String(left.id));
    });
    const page = sorted.slice(0, limit);
    const hasMore = sorted.length > limit || persistedMessages.length > limit;
    const chronologicalPage = page.reverse();
    const oldestMessage = chronologicalPage[0];

    return NextResponse.json({
      messages: chronologicalPage.map(formatMessage),
      hasMore,
      nextCursor: oldestMessage ? new Date(oldestMessage.timestamp).getTime() : null,
      nextCursorId: oldestMessage?.id ?? null,
    });
  } catch (error) {
    console.error("Watch Party chat history error:", error);
    return NextResponse.json({ error: "Failed to load chat history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const roomId: unknown = body.roomId;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const clientMessageId = typeof body.clientMessageId === "string" ? body.clientMessageId : "";

    if (!isValidRoomId(roomId) || !message || message.length > MESSAGE_LIMIT) {
      return NextResponse.json(
        { error: `Message must contain 1-${MESSAGE_LIMIT} characters` },
        { status: 400 }
      );
    }
    if (
      clientMessageId &&
      !/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(clientMessageId)
    ) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    await connectDB();
    const room = await WatchPartyRoom.findOne({
      roomId,
      isActive: true,
      "participants.userId": session.user.id,
    }).select("_id");

    if (!room) {
      return NextResponse.json({ error: "Room not found or not a participant" }, { status: 404 });
    }

    const messageId = clientMessageId || randomUUID();
    let storedMessage = await WatchPartyChatMessage.findOne({ roomId, id: messageId }).lean();
    if (storedMessage) {
      if (storedMessage.userId !== session.user.id || storedMessage.message !== message) {
        return NextResponse.json({ error: "Message ID has already been used" }, { status: 409 });
      }
    } else {
      if (!(await consumeMessageQuota(roomId, session.user.id))) {
        return NextResponse.json(
          { error: "You are sending messages too quickly. Try again shortly." },
          { status: 429 }
        );
      }

      const messageDocument = {
        roomId,
        id: messageId,
        userId: session.user.id,
        userName: session.user.name || "Member",
        avatarUrl: session.user.image || "",
        message,
        timestamp: new Date(),
        type: "text" as const,
      };

      try {
        storedMessage = await WatchPartyChatMessage.create(messageDocument);
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        storedMessage = await WatchPartyChatMessage.findOne({ roomId, id: messageId }).lean();
        if (
          !storedMessage ||
          storedMessage.userId !== session.user.id ||
          storedMessage.message !== message
        ) {
          return NextResponse.json({ error: "Message ID has already been used" }, { status: 409 });
        }
      }
    }

    const chatMessage = formatMessage(storedMessage);
    try {
      await triggerRoomEvent(roomId, "chat-message", chatMessage);
    } catch (error) {
      console.error("Watch Party message was saved but real-time delivery failed:", error);
      return NextResponse.json(
        {
          error: "Message was saved, but live delivery is unavailable. Retry to notify the room.",
          persisted: true,
          message: chatMessage,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Watch Party chat send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
