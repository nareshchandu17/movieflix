import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tmdbId = searchParams.get("tmdbId");

    if (!tmdbId) {
      return NextResponse.json({ error: "Missing tmdbId" }, { status: 400 });
    }

    await connectDB();

    // Find all collections for this user that contain this tmdbId
    const collectionItems = await CollectionItem.find({ tmdbId: Number(tmdbId) });
    
    // Filter by collections owned by this user
    const userCollections = await Collection.find({
      _id: { $in: collectionItems.map(item => item.collectionId) },
      userId: session.user.id,
    }).select("_id");

    const collectionIds = userCollections.map(col => col._id.toString());

    return NextResponse.json({ success: true, ids: collectionIds });
  } catch (error: any) {
    console.error("CHECK COLLECTIONS ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
