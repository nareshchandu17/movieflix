/**
 * AI Series Insights API Route
 * Provides structured narrative analysis for TV series using Gemini
 */

import { NextRequest, NextResponse } from "next/server";
import { getGeminiService, type MovieData } from "@/lib/geminiService";
import { securityLogger } from "@/lib/logger";

// Rate limiting and allowed origins (simplified for this route, using patterns from ai-facts)
const RATE_LIMIT_REQUESTS = 20;

/**
 * Get CORS headers
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Origin": origin || "*",
  };
  return headers;
}

/**
 * POST /api/ai-insights/series - Generate structured AI insights for a series
 */
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured", success: false },
        { status: 503, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { title, name } = body;

    if (!title && !name) {
      return NextResponse.json(
        { error: "Series title is required", success: false },
        { status: 400, headers: corsHeaders }
      );
    }

    const geminiService = getGeminiService();
    const movieData: MovieData = body;
    
    securityLogger.info("Starting AI series insights generation", {
      seriesTitle: title || name,
    });

    const result = await geminiService.generateSeriesInsights(movieData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate insights", success: false },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        insights: result.insights,
        success: true,
      },
      { 
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        } 
      }
    );
  } catch (error) {
    securityLogger.error("AI series insights generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { 
        error: errorMessage, 
        success: false,
        details: "Checks logs for specific failure reason."
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
