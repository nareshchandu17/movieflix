/**
 * @file app/api/content-engine/see-all/route.ts
 * @description API Route (`POST /api/content-engine/see-all`).
 * Invokes `PaginationHandler.getPage` to serve page/cursor pagination for See All and infinite-scroll views without global deduplication interference.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextResponse } from "next/server";
import { fetchStrategyPool, StrategyName } from "@/services/content-engine";

interface PaginationRequest {
  strategy: string;
  page?: number;
  limit?: number;
  genreId?: number;
  searchQuery?: string;
  cursor?: string;
}

export async function POST(req: Request) {
  try {
    const body: PaginationRequest = await req.json();
    if (!body || !body.strategy) {
      return NextResponse.json({ error: "Missing required 'strategy' parameter" }, { status: 400 });
    }

    const items = await fetchStrategyPool(body.strategy as StrategyName, {
      page: body.page || 1,
      limit: body.limit || 24,
    });

    const pageResponse = { items, total: items.length };
    return NextResponse.json(pageResponse, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/content-engine/see-all] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
