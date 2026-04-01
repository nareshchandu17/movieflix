import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ReactionClip from "@/models/ReactionClip";
import User from "@/models/User";

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params Promise in Next.js 15+
    const { id } = await params;
    console.log(`Fetching reactions for movie ID: ${id}`);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    // Test database connection
    try {
      await connectDB();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({ 
        success: false,
        message: "Database connection failed", 
        error: "Unable to connect to database" 
      }, { status: 500 });
    }

    // Check if ReactionClip model is available
    if (!ReactionClip) {
      console.error("ReactionClip model not found");
      return NextResponse.json({ 
        success: false,
        message: "Model not available", 
        error: "ReactionClip model not loaded" 
      }, { status: 500 });
    }

    console.log(`Fetching reactions with filters: movieId=${id}, visibility=public`);

    // Fetch public reactions for this movie, sorted by newest
    const reactions = await ReactionClip.find({
      movieId: id,
      visibility: "public"
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name avatar") // Include user info for display
    .lean();

    console.log(`Found ${reactions.length} reactions`);

    const total = await ReactionClip.countDocuments({
      movieId: id,
      visibility: "public"
    });

    console.log(`Total reactions: ${total}`);

    return NextResponse.json({
      success: true,
      reactions: reactions || [],
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: total > skip + limit
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch reactions error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch reactions", 
      error: (error as any).message,
      reactions: [],
      pagination: {
        total: 0,
        page: 1,
        totalPages: 0,
        hasNext: false
      }
    }, { status: 500 });
  }
}
