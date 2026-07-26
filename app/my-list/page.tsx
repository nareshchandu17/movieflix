import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Collection from "@/features/history/models/Collection";
import CollectionItem from "@/features/history/models/CollectionItem";
import MyListContainer from "@/features/history/components/collections/MyListContainer";
import { Library } from "lucide-react";
import mongoose from "mongoose";

export const metadata: Metadata = {
  title: "My List | MovieFlix",
  description: "Your saved collections and watchlist.",
};

// Next.js config to ensure dynamic rendering since it depends on session and DB
export const dynamic = "force-dynamic";

export default async function MyListPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/my-list");
  }

  await connectDB();

  // Fetch collections with items using aggregation to avoid N+1 queries (Issue 8 fix)
  const isValidId = mongoose.isValidObjectId(session.user.id);
  const userIdMatch = isValidId 
    ? { $in: [new mongoose.Types.ObjectId(session.user.id), session.user.id] }
    : session.user.id;

  const collectionsWithItems = await Collection.aggregate([
    { $match: { userId: userIdMatch } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "collectionitems",
        localField: "_id",
        foreignField: "collectionId",
        as: "items",
        pipeline: [
          { $sort: { addedAt: -1 } }
        ]
      }
    }
  ]);

  // Transform data for client components
  const serializedCollections = collectionsWithItems.map(col => {
    return {
      ...col,
      _id: col._id.toString(),
      userId: col.userId.toString(),
      createdAt: col.createdAt?.toISOString(),
      updatedAt: col.updatedAt?.toISOString(),
      items: col.items.map((item: any) => ({
        ...item,
        _id: item._id.toString(),
        collectionId: item.collectionId.toString(),
        addedAt: item.addedAt?.toISOString() || new Date().toISOString(),
        lastWatchedAt: item.lastWatchedAt ? item.lastWatchedAt.toISOString() : null,
      }))
    };
  });

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header Section */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black to-black z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=75&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-20 pb-12 w-full max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30 backdrop-blur-md">
                <Library className="w-6 h-6 text-red-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Library</span>
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl text-lg font-medium">
              Your personal collections, watchlists, and saved content.
            </p>
          </div>
        </div>
      </div>

      {/* Collections Section with instant client-side update */}
      <MyListContainer initialCollections={serializedCollections} />
    </div>
  );
}
