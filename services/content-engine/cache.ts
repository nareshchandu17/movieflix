/**
 * @file services/content-engine/cache.ts
 * @description STEP 8: Multi-Tier Cache for the Content Discovery Engine.
 * Caches strategy candidate pools, normalized pools, and deduplicated/allocated category results
 * to prevent unnecessary requests and guarantee instant UI responsiveness.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

export class ContentEngineCache {
  private static store: Map<string, CacheEntry<any>> = new Map();

  // Standard TTL constants
  public static readonly TTL_DYNAMIC = 5 * 60 * 1000; // 5 minutes for trending/time-based
  public static readonly TTL_STANDARD = 30 * 60 * 1000; // 30 minutes for category lists
  public static readonly TTL_STATIC = 60 * 60 * 1000; // 1 hour for top-rated/hidden gems

  /**
   * Set item in cache with specified TTL (defaults to 30 minutes).
   */
  public static set<T>(key: string, data: T, ttl: number = ContentEngineCache.TTL_STANDARD): void {
    if (!key || data === undefined || data === null) return;
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get item from cache if fresh within TTL.
   */
  public static get<T>(key: string): T | null {
    if (!key || !this.store.has(key)) return null;
    const entry = this.store.get(key)!;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Get item even if expired (stale-while-revalidate fallback if API fails).
   */
  public static getStale<T>(key: string): T | null {
    if (!key || !this.store.has(key)) return null;
    return this.store.get(key)!.data as T;
  }

  /**
   * Invalidate specific key or all keys matching prefix.
   */
  public static invalidate(prefix?: string): void {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Wrap an async operation with caching.
   */
  public static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = ContentEngineCache.TTL_STANDARD
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const freshData = await fetcher();
      
      // Prevent caching empty arrays to avoid cache poisoning on API failure
      if (Array.isArray(freshData) && freshData.length === 0) {
        console.warn(`[ContentEngineCache] Refusing to cache empty array for key "${key}"`);
        return freshData;
      }

      this.set(key, freshData, ttl);
      return freshData;
    } catch (e) {
      // Fallback to stale if fetch fails
      const stale = this.getStale<T>(key);
      if (stale !== null) {
        console.warn(`[ContentEngineCache] Serving stale data for key "${key}" due to error:`, e);
        return stale;
      }
      throw e;
    }
  }
}
