/**
 * @file app/api/content-engine/test/route.ts
 * @description Automated verification endpoint (`GET /api/content-engine/test`).
 * Exercises the complete Content Discovery Engine pipeline (`TMDBService -> Normalizer -> QualityFilter -> RankingEngine -> Allocator + GlobalDeduplicationRegistry`).
 * Verifies zero duplicate posters across 5 simulated carousels and checks score calculations.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextResponse } from "next/server";
import ContentEngine, { CarouselAllocationEngine, GlobalDeduplicationRegistry } from "@/services/content-engine";

export async function GET() {
  const startTime = Date.now();
  const testResults: any = {
    timestamp: new Date().toISOString(),
    status: "pass",
    steps: {},
    metrics: {},
  };

  try {
    // Reset global registry for a clean test run under pageKey="test_audit"
    const pageKey = "test_audit";
    GlobalDeduplicationRegistry.reset(pageKey);

    // 1. Test Allocation across 5 distinct carousels on the same simulated page
    const strategies = ["trending", "recommended", "crime", "mind-bending", "top-rated"] as const;
    const allocatedCarousels: Record<string, any[]> = {};
    const seenIds = new Set<string>();
    let totalAllocatedCount = 0;
    let duplicateCount = 0;

    for (const strategy of strategies) {
      const response = await CarouselAllocationEngine.allocate({
        strategy,
        limit: 20,
        page: 1,
        pageKey,
      });

      allocatedCarousels[strategy] = response.items.map((item) => ({
        id: item.id,
        title: item.title,
        mediaType: item.mediaType,
        voteAverage: item.voteAverage,
        voteCount: item.voteCount,
        contentScore: item.contentScore,
      }));

      // Check for exact cross-carousel duplicates
      for (const item of response.items) {
        const uniqueKey = `${item.mediaType}:${item.id}`;
        if (seenIds.has(uniqueKey)) {
          duplicateCount++;
        }
        seenIds.add(uniqueKey);
        totalAllocatedCount++;
      }
    }

    testResults.steps.allocationAudit = {
      carouselsAllocated: strategies.length,
      totalItemsAllocated: totalAllocatedCount,
      uniqueIdsInRegistry: GlobalDeduplicationRegistry.getClaimedCount(pageKey),
      crossCarouselDuplicates: duplicateCount,
      passed: duplicateCount === 0,
    };

    if (duplicateCount > 0) {
      testResults.status = "fail";
    }

    // 2. Test Quality Filter checks
    const sampleItems = Object.values(allocatedCarousels).flat();
    const lowRatingViolations = sampleItems.filter((item: any) => item.voteAverage < 6.0);
    testResults.steps.qualityFilterAudit = {
      totalItemsChecked: sampleItems.length,
      lowRatingViolations: lowRatingViolations.length,
      passed: lowRatingViolations.length === 0,
    };

    if (lowRatingViolations.length > 0) {
      testResults.status = "fail";
    }

    // 3. Test Ranking Engine Score ordering
    let rankingPassed = true;
    for (const [strategyName, items] of Object.entries(allocatedCarousels)) {
      for (let i = 0; i < items.length - 1; i++) {
        if (items[i].contentScore < items[i + 1].contentScore) {
          // Note: If strategy is "top-rated", it sorts by rating first, so skip score check
          if (strategyName !== "top-rated") {
            rankingPassed = false;
          }
        }
      }
    }
    testResults.steps.rankingEngineAudit = {
      scoreOrderVerified: rankingPassed,
      passed: rankingPassed,
    };

    testResults.metrics.durationMs = Date.now() - startTime;
    return NextResponse.json(testResults, { status: testResults.status === "pass" ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error?.message || String(error),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
