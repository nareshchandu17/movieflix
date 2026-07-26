import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ReactionClip from "@/features/social/models/ReactionClip";
import { rateLimit } from "@/lib/rateLimit";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
    const allowed = await rateLimit(ip, 100, 60); // 100 requests per minute
    if (!allowed) {
      return createErrorResponse("Rate limit exceeded", 429, "RATE_LIMITED");
    }

    // Unwrap params Promise in Next.js 15+
    const { id } = await params;
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    await connectDB();

    // Fetch public reactions for this movie using standardized field names
    const reactions = await ReactionClip.find({
      movieId: id,
      showInMoviePage: true,
      status: "approved"
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name avatar")
    .lean();

    const total = await ReactionClip.countDocuments({
      movieId: id,
      showInMoviePage: true,
      status: "approved"
    });

    // Map fields for consistency
    const mappedReactions = reactions.map(r => ({
      ...r,
      _id: r._id.toString(),
      likes: r.likesCount || 0,
      views: r.viewsCount || 0,
    }));

    return createSuccessResponse({
      reactions: mappedReactions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: total > skip + limit
      }
    });

  } catch (error) {
    console.error("Fetch reactions error:", error);
    return createErrorResponse(
      "Failed to fetch reactions",
      500,
      "API_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
