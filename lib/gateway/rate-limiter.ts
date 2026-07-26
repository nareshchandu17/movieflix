/**
 * @file rate-limiter.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { RedisManager } from "@/lib/redis";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_POLICIES = {
  SEARCH: { maxRequests: 20, windowMs: 60 * 1000 },
  DETAILS: { maxRequests: 60, windowMs: 60 * 1000 },
  HOME: { maxRequests: 30, windowMs: 60 * 1000 },
  GENERAL: { maxRequests: 50, windowMs: 60 * 1000 },
};

/**
 * Distributed Rate Limiter using Redis
 */
export async function gatewayRateLimit(
  identifier: string,
  policy: RateLimitConfig = RATE_LIMIT_POLICIES.GENERAL
) {
  const key = `ratelimit:${identifier}:${Math.floor(Date.now() / policy.windowMs)}`;

  try {
    const current = await RedisManager.increment(key);

    if (current === 1) {
      await RedisManager.expire(key, Math.ceil(policy.windowMs / 1000));
    }

    return {
      allowed: current <= policy.maxRequests,
      remaining: Math.max(0, policy.maxRequests - current),
      limit: policy.maxRequests,
    };
  } catch (error) {
    console.warn("[Gateway RateLimit] Redis error, falling back to permissive mode:", error);
    // Fallback: allow request but log warning
    return {
      allowed: true,
      remaining: 1,
      limit: policy.maxRequests,
    };
  }
}
