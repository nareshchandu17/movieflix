import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

// DELETE /api/mylist/remove - Remove item from collection
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectionId, tmdbId } = await request.json();

    if (!collectionId || !tmdbId) {
      return NextResponse.json({
        error: "Collection ID and TMDB ID are required"
      }, { status: 400 });
    }

    await connectDB();

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

    // Find and delete the item
    const result = await CollectionItem.deleteOne({
      collectionId,
      tmdbId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        error: "Item not found in collection"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from collection"
    });

  } catch (error: any) {
    console.error("Error removing item from collection:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to remove item from collection"
    }, { status: 500 });
  }
}
