import { NextRequest } from "next/server";
import { SearchSchema } from "@/lib/gateway/schemas";
import { createGatewayResponse, createGatewayError } from "@/lib/gateway/response";
import { gatewayRateLimit, RATE_LIMIT_POLICIES } from "@/lib/gateway/rate-limiter";
import { GatewayClients } from "@/lib/gateway/clients";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  
  // 1. Validation
  const validated = SearchSchema.safeParse({
    query: searchParams.get("query"),
    page: searchParams.get("page"),
    type: searchParams.get("type"),
  });

  if (!validated.success) {
    return createGatewayError("Invalid search parameters", 400);
  }

  const { query, page, type } = validated.data;

  // 2. Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const limit = await gatewayRateLimit(ip, RATE_LIMIT_POLICIES.SEARCH);
  
  if (!limit.allowed) {
    return createGatewayError("Too many search requests. Please try again in a minute.", 429);
  }

  try {
    // 3. Execution (Parallel TMDB + Gemini for semantic intelligence)
    const [tmdbResults, geminiResults] = await Promise.all([
      GatewayClients.tmdb.search(query, type as any, page),
      query.length > 10 ? GatewayClients.gemini.search(query) : Promise.resolve(null),
    ]);

    const data = {
      results: tmdbResults.results,
      pagination: {
        page: tmdbResults.page,
        total_pages: tmdbResults.total_pages,
        total_results: tmdbResults.total_results,
      },
      semantic_context: geminiResults,
    };

    const response = createGatewayResponse(data, {
      source: "live",
      latency: Date.now() - startTime,
    });

    // 4. Set Rate Limit Headers
    response.headers.set("X-RateLimit-Limit", limit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limit.remaining.toString());

    return response;
  } catch (error: any) {
    console.error("[Gateway Search] Error:", error.message);
    return createGatewayError("Search service currently unavailable", 500);
  }
}
