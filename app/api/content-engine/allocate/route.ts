/**
 * @file app/api/content-engine/allocate/route.ts
 * @description API Route (`POST /api/content-engine/allocate`).
 * Invokes `CarouselAllocationEngine.allocate` to serve unique, ranked, deduplicated items for client carousels (`MovieCarousel`).
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextResponse } from "next/server";
import { CarouselAllocationEngine } from "@/services/content-engine";
import { AllocationRequest } from "@/services/content-engine/types";

export async function POST(req: Request) {
  try {
    const body: AllocationRequest = await req.json();
    if (!body || !body.strategy) {
      return NextResponse.json({ error: "Missing required 'strategy' parameter" }, { status: 400 });
    }

    const allocationResponse = await CarouselAllocationEngine.allocate(body);
    return NextResponse.json(allocationResponse, { status: 200 });
  } catch (error: any) {
    console.error("[API /api/content-engine/allocate] Error:", error);
    return NextResponse.json(
      { error: "Failed to allocate content", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
