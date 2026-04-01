import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Watchlist from "@/models/Watchlist";

// GET user's watchlist
export async function GET(req: NextRequest) {
  try {
    // Mock user ID since authentication is removed - using valid ObjectId format
    const mockUserId = "507f1f77bcf86cd799439011";

    await connectDB();

    // Return empty array for demo since no data exists
    return NextResponse.json({ 
      watchlist: [],
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ message: "Failed to fetch watchlist" }, { status: 500 });
  }
}

// POST item to watchlist
export async function POST(req: NextRequest) {
  try {
    // Mock user ID since authentication is removed - using valid ObjectId format
    const mockUserId = "507f1f77bcf86cd799439011";

    const { contentId, contentType } = await req.json();

    if (!contentId || !contentType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // For demo, just return success without actually saving to database
    return NextResponse.json({ 
      message: "Added to watchlist (demo)",
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ message: "Failed to add to watchlist" }, { status: 500 });
  }
}

// DELETE item from watchlist
export async function DELETE(req: NextRequest) {
  try {
    // Mock user ID since authentication is removed - using valid ObjectId format
    const mockUserId = "507f1f77bcf86cd799439011";

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
       return NextResponse.json({ message: "Missing contentId" }, { status: 400 });
    }

    // For demo, just return success without actually deleting from database
    return NextResponse.json({ 
      message: "Removed from watchlist (demo)",
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json({ message: "Failed to remove from watchlist" }, { status: 500 });
  }
}
