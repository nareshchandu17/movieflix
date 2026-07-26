/**
 * @file services/content-engine/allocator.ts
 * @description STEP 6: Carousel Allocation Engine (`allocator`).
 * Coordinates strategy fetching, caching, and global deduplication registry claims to deliver exact allocations (`limit: 20`) for UI carousels.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { AllocationRequest, AllocationResponse, NormalizedMediaItem } from "./types";
import { fetchStrategyPool } from "./strategies";
import { GlobalDeduplicationRegistry } from "./deduplication-registry";
import { ContentEngineCache } from "./cache";

export class CarouselAllocationEngine {
  /**
   * Allocates unique items for a specific carousel or section.
   * By default, checks against `GlobalDeduplicationRegistry` under `request.pageKey` (or "global").
   */
   public static async allocate(request: AllocationRequest): Promise<AllocationResponse> {
    const {
      strategy = "trending",
      limit = 20,
      page = 1,
      pageKey = "global",
      options = {},
    } = request;

    // Cache key incorporates strategy, user history trigger, and page options
    const cacheKey = `content-engine:strategy:${strategy}:p${page}:options:${JSON.stringify({
      lastWatchedId: options.lastWatchedId,
      minRating: options.minRating,
      keywordMatch: options.keywordMatch,
    })}`;

    // Determine cache TTL depending on how dynamic the strategy is
    const ttl =
      strategy === "trending" || strategy === "time-based"
        ? ContentEngineCache.TTL_DYNAMIC
        : strategy === "top-rated" || strategy === "hidden-gems"
        ? ContentEngineCache.TTL_STATIC
        : ContentEngineCache.TTL_STANDARD;

    // Fetch ranked strategy pool via cache
    const candidatePool = await ContentEngineCache.getOrSet<NormalizedMediaItem[]>(
      cacheKey,
      () => fetchStrategyPool(strategy, { page, ...options }),
      ttl
    );

    // Apply global deduplication unless explicitly disabled (e.g. for See All / deep pagination views)
    const applyDedupe = options.applyGlobalDeduplication !== false;
    let allocatedItems: NormalizedMediaItem[] = [];

    // Filter by pageKey constraints to ensure Series page only shows series
    let filteredPool = candidatePool;
    if (pageKey === "series") {
      filteredPool = candidatePool.filter(item => item.mediaType === "tv" || item.mediaType === "anime");
    } else if (pageKey === "movies") {
      filteredPool = candidatePool.filter(item => item.mediaType === "movie");
    }

    if (applyDedupe) {
      allocatedItems = GlobalDeduplicationRegistry.claimAndAllocate(
        filteredPool,
        limit,
        pageKey,
        options.excludeIds || []
      );
    } else {
      allocatedItems = filteredPool.slice(0, limit);
    }

    return {
      strategy,
      page,
      limit,
      totalAvailable: candidatePool.length,
      items: allocatedItems,
    };
  }
}
