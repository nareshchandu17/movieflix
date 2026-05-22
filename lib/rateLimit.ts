/**
 * @file rateLimit.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { redis } from "./redis";

/**
 * Production Rate Limiter
 * @param identifier Usually user IP or UserID
 * @param limit Max requests allowed in the window
 * @param window Window size in seconds
 * @returns boolean indicating if request is allowed
 */
export async function rateLimit(identifier: string, limit: number = 20, window: number = 60): Promise<boolean> {
  if (!redis) return true; // Fail-open strategy: Allow traffic if Redis is down

  const key = `rate:${identifier}`;

  try {
    const current = await redis.incr(key);

    // If it's the first request in the window, set expiry
    if (current === 1) {
      await redis.expire(key, window);
    }

    return current <= limit;
  } catch (err) {
    console.error(`[RateLimit] Error for ${identifier}:`, err);
    return true; // Fail-open: Don't block users due to Redis failure
  }
}
