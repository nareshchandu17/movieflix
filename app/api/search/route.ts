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
    query: searchParams.get("query") || searchParams.get("q") || "",
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
    // 3. Execution (Gemini first for semantic intelligence)
    const geminiResults = query.length > 10 ? await GatewayClients.gemini.search(query) : null;
    
    let tmdbResults;

    if (geminiResults?.intent && ['FORMULA', 'SCENE', 'VIBE'].includes(geminiResults.intent) && geminiResults.suggested_movie_titles?.length > 0) {
      // Magic Search: Fetch exact titles suggested by AI
      const moviePromises = geminiResults.suggested_movie_titles.map((title: string) => 
        GatewayClients.tmdb.search(title, 'movie', 1)
      );
      const specificMovieResults = await Promise.all(moviePromises);
      
      // Combine results taking the top hit from each search
      const combinedResults = specificMovieResults.map(res => res.results[0]).filter(Boolean);
      
      tmdbResults = {
        results: combinedResults,
        page: 1,
        total_pages: 1,
        total_results: combinedResults.length
      };
    } else {
      // Standard Search Fallback
      tmdbResults = await GatewayClients.tmdb.search(query, type as any, page);
    }

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
