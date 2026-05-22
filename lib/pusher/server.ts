/**
 * @file server.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

let pusherServerInstance: Pusher | null = null;

function getPusherServer(): Pusher {
  if (!pusherServerInstance) {
    if (!appId || !key || !secret || !cluster) {
      console.warn(
        `⚠️ Missing Pusher server-side configuration in environment variables. ` +
        `Ensure PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER are configured.`
      );
      // Return a dummy Pusher client so the build does not throw on import
      return new Pusher({
        appId: "dummy",
        key: "dummy",
        secret: "dummy",
        cluster: "us2",
        useTLS: true,
      });
    }
    pusherServerInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return pusherServerInstance;
}

export const pusherServer = {
  trigger: async (channelName: string, event: string, data: any) => {
    if (!appId || !key || !secret || !cluster) {
      console.warn("❌ Pusher is not configured. Skipping trigger.");
      return;
    }
    return getPusherServer().trigger(channelName, event, data);
  },
  authorizeChannel: (socketId: string, channelName: string, data?: any) => {
    if (!appId || !key || !secret || !cluster) {
      throw new Error("❌ Pusher is not configured.");
    }
    return getPusherServer().authorizeChannel(socketId, channelName, data);
  }
};

/**
 * Triggers an event on a Watch Party presence channel: presence-room-{roomId}
 */
export async function triggerRoomEvent(
  roomId: string,
  event: string,
  data: unknown
): Promise<void> {
  const channelName = `presence-room-${roomId}`;
  if (channelName.length > 200) {
    throw new Error(`Pusher channel name exceeds 200 characters limit: ${channelName}`);
  }
  await pusherServer.trigger(channelName, event, data);
}

/**
 * Triggers an event on a per-user private channel: private-user-{userId}
 */
export async function triggerUserEvent(
  userId: string,
  event: string,
  data: unknown
): Promise<void> {
  const channelName = `private-user-${userId}`;
  if (channelName.length > 200) {
    throw new Error(`Pusher channel name exceeds 200 characters limit: ${channelName}`);
  }
  await pusherServer.trigger(channelName, event, data);
}

/**
 * Triggers an event on a WebRTC private signaling channel: private-signal-{targetUserId}
 */
export async function triggerSignalEvent(
  targetUserId: string,
  event: string,
  data: unknown
): Promise<void> {
  const channelName = `private-signal-${targetUserId}`;
  if (channelName.length > 200) {
    throw new Error(`Pusher channel name exceeds 200 characters limit: ${channelName}`);
  }
  await pusherServer.trigger(channelName, event, data);
}
