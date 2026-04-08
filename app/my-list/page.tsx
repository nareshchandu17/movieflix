import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import CollectionItem from "@/models/CollectionItem";
import CollectionCarousel from "@/components/collections/CollectionCarousel";
import MyListHeaderAction from "@/components/collections/MyListHeaderAction";
import { Bookmark, Library, Film, Tv } from "lucide-react";

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

  // Fetch collections for user
  const collections = await Collection.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

  // Fetch items for each collection
  const collectionsWithItems = await Promise.all(
    collections.map(async (col) => {
      const items = await CollectionItem.find({ collectionId: col._id })
        .sort({ addedAt: -1 })
        .lean();
      
      // Transform MongoDB _id to string for Client Components
      const serializedItems = items.map(item => ({
        ...item,
        _id: item._id.toString(),
        collectionId: item.collectionId.toString(),
        addedAt: item.addedAt?.toISOString() || new Date().toISOString(),
        lastWatchedAt: item.lastWatchedAt ? item.lastWatchedAt.toISOString() : null,
      }));

      return {
        ...col,
        _id: col._id.toString(),
        userId: col.userId.toString(),
        createdAt: col.createdAt?.toISOString(),
        updatedAt: col.updatedAt?.toISOString(),
        items: serializedItems
      };
    })
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header Section */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black to-black z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        
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
          <div>
            <MyListHeaderAction />
          </div>
        </div>
      </div>

      {/* Collections Section */}
      <div className="relative z-20 -mt-8">
        {collectionsWithItems.length === 0 ? (
          <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-16 text-center">
            <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Bookmark className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your library is empty</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Start adding your favorite movies and TV series to your collections by clicking the + button on any title.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {collectionsWithItems.map((collection) => (
              <CollectionCarousel 
                key={collection._id} 
                title={collection.name} 
                items={collection.items} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
