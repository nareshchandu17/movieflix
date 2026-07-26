import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import Collection from "@/features/history/models/Collection";
import CollectionItem from "@/features/history/models/CollectionItem";
import { withContentFilter } from "@/lib/contentFilterMiddleware";
import mongoose from "mongoose";
import { escapeRegExp, MIN_COLLECTION_NAME_LENGTH, MAX_COLLECTION_NAME_LENGTH } from "@/features/history/schemas/collection-validation";

async function collectionsHandler(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const isValidId = mongoose.isValidObjectId(session.user.id);
    const userIdMatch = isValidId 
      ? { $in: [new mongoose.Types.ObjectId(session.user.id), session.user.id] }
      : session.user.id;

    const collections = await Collection.find({ userId: userIdMatch }).sort({ createdAt: -1 });

    // For each collection, get the item count
    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const count = await CollectionItem.countDocuments({ collectionId: col._id });
        const items = await CollectionItem.find({ collectionId: col._id })
          .sort({ addedAt: -1 })
          .limit(4)
          .select("posterPath");

        return {
          ...col.toObject(),
          _id: col._id.toString(),
          userId: col.userId.toString(),
          itemCount: count,
          previewItems: items.map(item => item.posterPath),
        };
      })
    );

    return NextResponse.json({ success: true, collections: collectionsWithCount });
  } catch (error: any) {
    console.error("GET COLLECTIONS ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { name, icon, description, color } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Collection name is required." }, { status: 400 });
    }

    const cleanName = name.trim().replace(/\s+/g, " ");

    if (cleanName.length < MIN_COLLECTION_NAME_LENGTH || cleanName.length > MAX_COLLECTION_NAME_LENGTH) {
      return NextResponse.json({ 
        error: `Collection name must contain between ${MIN_COLLECTION_NAME_LENGTH} and ${MAX_COLLECTION_NAME_LENGTH} characters.` 
      }, { status: 400 });
    }

    await connectDB();

    const isValidId = mongoose.isValidObjectId(session.user.id);
    const userIdMatch = isValidId 
      ? { $in: [new mongoose.Types.ObjectId(session.user.id), session.user.id] }
      : session.user.id;

    // Check for duplicate names for this user (case-insensitive and safe against regex special chars)
    const existing = await Collection.findOne({ 
      userId: userIdMatch, 
      name: { $regex: new RegExp(`^${escapeRegExp(cleanName)}$`, "i") } 
    });

    if (existing) {
      return NextResponse.json({ error: "A collection with this name already exists." }, { status: 400 });
    }

    const newUserId = isValidId ? new mongoose.Types.ObjectId(session.user.id) : session.user.id;

    const newCollection = await Collection.create({
      userId: newUserId,
      name: cleanName,
      icon: icon || "🎬",
      description: description || "",
      color: color || "blue",
    });

    return NextResponse.json({ 
      success: true, 
      collection: {
        ...newCollection.toObject(),
        _id: newCollection._id.toString(),
        userId: newCollection.userId.toString(),
        itemCount: 0,
        previewItems: [],
        items: [],
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE COLLECTION ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}

// Export the handler with content filtering applied
export const GET = withContentFilter(collectionsHandler);
