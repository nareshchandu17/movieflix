import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

// GET /api/mylist/continue-watching - Get items being watched
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all user's collections
    const collections = await Collection.find({ userId: session.user.id }).lean();
    const collectionIds = collections.map(c => c._id);

    // Get items with watch progress > 0 and < 100
    const continueWatchingItems = await CollectionItem.find({
      collectionId: { $in: collectionIds },
      watchProgress: { $gt: 0, $lt: 100 },
      lastWatchedAt: { $ne: null }
    })
    .sort({ lastWatchedAt: -1 })
    .limit(10)
    .lean();

    return NextResponse.json({
      success: true,
      items: continueWatchingItems.map(item => ({
        ...item,
        _id: item._id.toString()
      }))
    });

  } catch (error: any) {
    console.error("Error fetching continue watching:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch continue watching items"
    }, { status: 500 });
  }
}

// PATCH /api/mylist/continue-watching - Update watch progress
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectionId, tmdbId, progress, watched } = await request.json();

    if (!collectionId || !tmdbId || progress === undefined) {
      return NextResponse.json({
        error: "Missing required fields"
      }, { status: 400 });
    }

    await dbConnect();

    // Verify collection belongs to user
    const collection = await Collection.findOne({
      _id: collectionId,
      userId: session.user.id
    });

    if (!collection) {
      return NextResponse.json({
        error: "Collection not found"
      }, { status: 404 });
    }

    // Update item progress
    const result = await CollectionItem.updateOne(
      { collectionId, tmdbId },
      {
        $set: {
          watchProgress: Math.min(100, Math.max(0, progress)),
          watched: watched || progress >= 100,
          lastWatchedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        error: "Item not found in collection"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Watch progress updated"
    });

  } catch (error: any) {
    console.error("Error updating watch progress:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update watch progress"
    }, { status: 500 });
  }
}
