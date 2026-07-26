/**
 * @file response.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextResponse } from "next/server";

export interface GatewayResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    source: "cache" | "live";
    latency: number;
    cached_at?: string;
  };
}

export function createGatewayResponse<T>(
  data: T,
  meta?: GatewayResponse<T>["meta"]
): NextResponse<any> {
  const rootProps = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  return NextResponse.json({
    success: true,
    ...rootProps,
    data,
    meta: {
      source: meta?.source || "live",
      latency: meta?.latency || 0,
      cached_at: meta?.cached_at,
    },
  });
}

export function createGatewayError(
  message: string,
  status: number = 400
): NextResponse<GatewayResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
