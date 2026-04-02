import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collectionId, tmdbId } = await req.json();

    if (!collectionId || !tmdbId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await connectDB();

    // Verify ownership
    const col = await Collection.findOne({ _id: collectionId, userId: session.user.id });
    if (!col) return NextResponse.json({ error: "Collection not found or unauthorized" }, { status: 404 });

    // Remove item
    await CollectionItem.deleteOne({ collectionId, tmdbId });

    return NextResponse.json({ success: true, message: "Removed from collection" });
  } catch (error: any) {
    console.error("REMOVE FROM COLLECTION ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
