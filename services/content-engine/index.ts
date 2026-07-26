/**
 * @file services/content-engine/index.ts
 * @description Master Facade & Public API for the MovieFlix Content Discovery & Recommendation Engine.
 * Single entry point cleanly exporting all enterprise curation layers, allocation models, and parallel strategy pipelines.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

export * from "./types";
export * from "./tmdb-service";
export * from "./normalizer";
export * from "./quality-filter";
export * from "./ranking-engine";
export * from "./deduplication-registry";
export * from "./allocator";

export * from "./cache";
export * from "./strategies";

import { CarouselAllocationEngine } from "./allocator";

import { GlobalDeduplicationRegistry } from "./deduplication-registry";
import { TMDBService } from "./tmdb-service";
import { ContentNormalizer } from "./normalizer";
import { QualityFilter } from "./quality-filter";
import { RankingEngine } from "./ranking-engine";
import { ContentEngineCache } from "./cache";

export const ContentEngine = {
  allocate: CarouselAllocationEngine.allocate,

  deduplication: GlobalDeduplicationRegistry,
  cache: ContentEngineCache,
  tmdb: TMDBService,
  normalizer: ContentNormalizer,
  qualityFilter: QualityFilter,
  rankingEngine: RankingEngine,
};

export default ContentEngine;
