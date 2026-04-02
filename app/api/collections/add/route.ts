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

    const { collectionIds, tmdbId, mediaType, title, posterPath, backdropPath, overview, releaseDate, voteAverage, genreIds } = await req.json();

    if (!collectionIds || !Array.isArray(collectionIds) || collectionIds.length === 0) {
      return NextResponse.json({ error: "No collections specified" }, { status: 400 });
    }

    if (!tmdbId || !mediaType || !title) {
      return NextResponse.json({ error: "Missing required item data" }, { status: 400 });
    }

    await connectDB();

    const results = await Promise.all(
      collectionIds.map(async (colId) => {
        // Verify ownership
        const col = await Collection.findOne({ _id: colId, userId: session.user.id });
        if (!col) return { id: colId, success: false, error: "Collection not found or unauthorized" };

        // Check if item already exists in this collection
        const existing = await CollectionItem.findOne({ collectionId: colId, tmdbId });
        if (existing) return { id: colId, success: true, alreadyExists: true };

        // Add item
        await CollectionItem.create({
          collectionId: colId,
          tmdbId,
          mediaType,
          title,
          posterPath: posterPath || "",
          backdropPath: backdropPath || "",
          overview: overview || "",
          releaseDate: releaseDate || "",
          voteAverage: voteAverage || 0,
          genreIds: genreIds || [],
          addedAt: new Date(),
        });

        return { id: colId, success: true };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("ADD ITEM TO COLLECTION ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
