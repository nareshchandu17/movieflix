/**
 * @file redis.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Fail-safe initialization for production builds/CI
export const redis = url && token 
  ? new Redis({ url, token })
  : null;

if (!redis) {
  console.warn("⚠️ Upstash Redis: Credentials missing. Redis features (Cache/RateLimit) will be disabled.");
}

/**
 * RedisManager Class
 * Migrated to Upstash Redis (HTTP-based Serverless)
 * Provides full backward compatibility for MovieFlix systems using ONLY Upstash REST.
 */
export class RedisManager {
  static async set(key: string, value: any, ttl?: number) {
    if (!redis) return;
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    } catch (err) {
      console.error(`❌ Upstash: set failed for ${key}:`, err);
    }
  }

  static async get<T = any>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      return await redis.get<T>(key);
    } catch (err) {
      console.error(`❌ Upstash: get failed for ${key}:`, err);
      return null;
    }
  }

  static async del(key: string) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      console.error(`❌ Upstash: del failed for ${key}:`, err);
    }
  }

  static async keys(pattern: string): Promise<string[]> {
    if (!redis) return [];
    try {
      return await redis.keys(pattern);
    } catch (err) {
      console.error(`❌ Upstash: keys failed for ${pattern}:`, err);
      return [];
    }
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    if (!redis) return 0;
    try {
      return await redis.incrby(key, amount);
    } catch (err) {
      console.error(`❌ Upstash: incr failed for ${key}:`, err);
      return 0;
    }
  }

  static async expire(key: string, seconds: number) {
    if (!redis) return;
    try {
      await redis.expire(key, seconds);
    } catch (err) {
      console.error(`❌ Upstash: expire failed for ${key}:`, err);
    }
  }

  static async publish(channel: string, message: string) {
    if (!redis) return;
    try {
      await redis.publish(channel, message);
    } catch (err) {
      console.error(`❌ Upstash: publish failed for ${channel}:`, err);
    }
  }

  // --- Synchronization Methods ---

  static async setProgress(profileId: string, contentId: string, progress: number, duration: number) {
    const key = `progress:${profileId}:${contentId}`;
    await this.set(key, { progress, duration, updatedAt: Date.now(), deviceId: 'current' }, 7 * 24 * 60 * 60);
  }

  static async getProgress(profileId: string, contentId: string) {
    return await this.get(`progress:${profileId}:${contentId}`);
  }

  static async getProfileProgress(profileId: string): Promise<any[]> {
    if (!redis) return [];
    try {
      const keys = await this.keys(`progress:${profileId}:*`);
      if (keys.length === 0) return [];
      
      const r = redis!;
      const p = r.pipeline();
      keys.forEach(key => p.get(key));
      const results = await p.exec();
      
      return results.map((value, index) => {
        if (!value) return null;
        const parts = keys[index].split(':');
        return { contentId: parts[parts.length - 1], ...(value as object) };
      }).filter(Boolean);
    } catch (err) {
      console.error("❌ Upstash: getProfileProgress error:", err);
      return [];
    }
  }

  static async emitSyncEvent(profileId: string, event: string, data: any) {
    const key = `sync:${profileId}:${event}`;
    await this.set(key, { event, data, timestamp: Date.now(), source: 'server' }, 30);
  }

  static async getSyncEvents(profileId: string, event?: string): Promise<any[]> {
    if (!redis) return [];
    try {
      const pattern = event ? `sync:${profileId}:${event}` : `sync:${profileId}:*`;
      const keys = await this.keys(pattern);
      if (keys.length === 0) return [];
      
      const r = redis!;
      const p = r.pipeline();
      keys.forEach(key => p.get(key));
      const results = await p.exec();
      
      return results.map((value, index) => {
        if (!value) return null;
        const parts = keys[index].split(':');
        return { event: parts[parts.length - 1], ...(value as object) };
      }).filter(Boolean);
    } catch (err) {
      console.error("❌ Upstash: getSyncEvents error:", err);
      return [];
    }
  }

  // --- Session & Device Tracking ---

  static async setSession(userId: string, deviceId: string, sessionData: any) {
    await this.set(`session:${userId}:${deviceId}`, sessionData, 24 * 60 * 60);
  }

  static async updateDeviceStatus(deviceId: string, status: 'online' | 'offline') {
    await this.set(`device:${deviceId}`, { status, lastSeen: Date.now() }, 5 * 60);
  }

  // --- Cache Management ---

  static async invalidateProfileCache(profileId: string) {
    if (!redis) return;
    try {
      const patterns = [`progress:${profileId}:*`, `sync:${profileId}:*`, `session:${profileId}:*`];
      const r = redis!;
      for (const pattern of patterns) {
        const keys = await this.keys(pattern);
        if (keys.length > 0) {
          const p = r.pipeline();
          keys.forEach(k => p.del(k));
          await p.exec();
        }
      }
    } catch (err) {
      console.error("❌ Upstash: invalidateProfileCache error:", err);
    }
  }

  static async healthCheck() {
    if (!redis) return { status: 'disabled', redis: false };
    try {
      await redis.ping();
      return { status: 'connected', redis: true };
    } catch (err: any) {
      return { status: 'error', redis: false, error: err.message };
    }
  }

  static async getStats() {
    if (!redis) return { status: 'disabled', provider: 'upstash' };
    try {
      const keys = await redis.dbsize();
      return { status: 'connected', keys, provider: 'upstash' };
    } catch (err) {
      return { status: 'error', error: 'Failed to fetch stats' };
    }
  }
}

export default RedisManager;
