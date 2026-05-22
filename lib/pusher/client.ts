/**
 * @file client.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import Pusher from "pusher-js";

let pusherClientInstance: Pusher | null = null;

/**
 * Returns the singleton instance of the Pusher client.
 */
export function getPusherClient(): Pusher {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn("⚠️ Missing Pusher client-side configuration (NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER). Real-time features may not work.");
    }

    pusherClientInstance = new Pusher(key || "", {
      cluster: cluster || "",
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    });
  }
  return pusherClientInstance;
}
