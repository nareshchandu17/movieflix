import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

// POST /api/mylist/add - Add item to collection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectionId, tmdbId, mediaType, title, posterPath, backdropPath, overview, releaseDate, voteAverage, genreIds } = await request.json();

    if (!collectionId || !tmdbId || !mediaType || !title) {
      return NextResponse.json({
        error: "Missing required fields"
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

    // Check if item already exists in collection
    const existingItem = await CollectionItem.findOne({
      collectionId,
      tmdbId
    });

    if (existingItem) {
      return NextResponse.json({
        error: "Item already exists in this collection"
      }, { status: 409 });
    }

    const item = new CollectionItem({
      collectionId,
      tmdbId,
      mediaType,
      title,
      posterPath,
      backdropPath,
      overview,
      releaseDate,
      voteAverage,
      genreIds: genreIds || []
    });

    await item.save();

    return NextResponse.json({
      success: true,
      item: {
        ...item.toObject(),
        _id: item._id.toString()
      }
    });

  } catch (error: any) {
    console.error("Error adding item to collection:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to add item to collection"
    }, { status: 500 });
  }
}
