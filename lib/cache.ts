/**
 * @file cache.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { redis } from "./redis";

/**
 * Production Caching Utility
 * Implements safe error handling to prevent API crashes if Redis is down.
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch (err) {
    console.error(`[Cache] GET Error for key ${key}:`, err);
    return null; // Fallback to DB
  }
}

export async function setCache(key: string, value: any, ttl: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttl });
  } catch (err) {
    console.error(`[Cache] SET Error for key ${key}:`, err);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[Cache] DEL Error for key ${key}:`, err);
  }
}
