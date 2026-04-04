import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db/mongodb";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

// GET /api/mylist/items/[collectionId] - Get items in a collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectionId } = await params;

    if (!collectionId) {
      return NextResponse.json({
        error: "Collection ID is required"
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

    // Get items in collection, sorted by added date
    const items = await CollectionItem.find({ collectionId })
      .sort({ addedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      items: items.map(item => ({
        ...item,
        _id: item._id.toString()
      }))
    });

  } catch (error: any) {
    console.error("Error fetching collection items:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch collection items"
    }, { status: 500 });
  }
}
