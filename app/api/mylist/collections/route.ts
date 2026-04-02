import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

// GET /api/mylist/collections - Get user's collections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const collections = await Collection.find({ userId: session.user.id })
      .sort({ createdAt: 1 })
      .lean();

    // Get item counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const itemCount = await CollectionItem.countDocuments({
          collectionId: collection._id
        });

        return {
          ...collection,
          itemCount,
          _id: collection._id.toString()
        };
      })
    );

    return NextResponse.json({
      success: true,
      collections: collectionsWithCounts
    });

  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch collections"
    }, { status: 500 });
  }
}

// POST /api/mylist/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, icon, description, color } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({
        error: "Collection name is required"
      }, { status: 400 });
    }

    await connectDB();

    // Check if collection with same name already exists for this user
    const existingCollection = await Collection.findOne({
      userId: session.user.id,
      name: name.trim()
    });

    if (existingCollection) {
      return NextResponse.json({
        error: "A collection with this name already exists"
      }, { status: 409 });
    }

    const collection = new Collection({
      userId: session.user.id,
      name: name.trim(),
      icon: icon || "🎬",
      description: description?.trim() || "",
      color: color || "blue"
    });

    await collection.save();

    return NextResponse.json({
      success: true,
      collection: {
        ...collection.toObject(),
        _id: collection._id.toString(),
        itemCount: 0
      }
    });

  } catch (error: any) {
    console.error("Error creating collection:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create collection"
    }, { status: 500 });
  }
}
