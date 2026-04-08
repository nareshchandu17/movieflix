import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";
import { withContentFilter } from "@/lib/contentFilterMiddleware";

async function collectionsHandler(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const collections = await Collection.find({ userId: session.user.id }).sort({ createdAt: -1 });

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

    const { name, icon, description, color } = await req.json();

    if (!name || name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "Invalid collection name (2-60 characters)" }, { status: 400 });
    }

    await connectDB();

    // Check for duplicate names for this user
    const existing = await Collection.findOne({ userId: session.user.id, name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return NextResponse.json({ error: "A collection with this name already exists" }, { status: 400 });
    }

    const newCollection = await Collection.create({
      userId: session.user.id,
      name,
      icon: icon || "🎬",
      description: description || "",
      color: color || "blue",
    });

    return NextResponse.json({ 
      success: true, 
      data: { collection: newCollection }
    });
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
