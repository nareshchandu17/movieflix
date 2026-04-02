"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AIWatchOrder from "./AIWatchOrder";
import ContinueWatching from "./ContinueWatching";
import SmartCollections from "./SmartCollections";
import RecentlyWatched from "./RecentlyWatched";
import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";

interface Collection {
  _id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  itemCount: number;
  createdAt: string;
}

interface CollectionItem {
  _id: string;
  tmdbId: number;
  mediaType: "movie" | "series" | "anime";
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  watchProgress: number;
  watched: boolean;
  lastWatchedAt: string | null;
  addedAt: string;
}

export default function MyListClient() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState<CollectionItem[]>([]);
  const [recentlyWatchedItems, setRecentlyWatchedItems] = useState<CollectionItem[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchMyListData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchMyListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch collections
      const collectionsResponse = await fetch("/api/mylist/collections");
      if (!collectionsResponse.ok) {
        throw new Error("Failed to fetch collections");
      }
      const collectionsData = await collectionsResponse.json();
      
      if (collectionsData.success) {
        setCollections(collectionsData.collections);
      }

      // Fetch continue watching items
      const continueResponse = await fetch("/api/mylist/continue-watching");
      if (continueResponse.ok) {
        const continueData = await continueResponse.json();
        if (continueData.success) {
          setContinueWatchingItems(continueData.items);
        }
      }

      // Fetch recently watched items (last 10 items with lastWatchedAt)
      const recentResponse = await fetch("/api/mylist/continue-watching");
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        if (recentData.success) {
          // Filter for items that are fully watched and sort by lastWatchedAt
          const fullyWatched = recentData.items
            .filter(item => item.watched && item.lastWatchedAt)
            .sort((a: any, b: any) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
            .slice(0, 8);
          setRecentlyWatchedItems(fullyWatched);
        }
      }

    } catch (error: any) {
      console.error("Error fetching My List data:", error);
      setError(error.message || "Failed to load your collections");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-600/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchMyListData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no collections
  if (collections.length === 0 && continueWatchingItems.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            My List
          </h1>
          <p className="text-gray-400 mt-1">
            Your personal collection, curated by AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* AI Watch Order - Show if there are items to recommend */}
        {continueWatchingItems.length > 0 && (
          <AIWatchOrder items={continueWatchingItems} />
        )}

        {/* Continue Watching */}
        {continueWatchingItems.length > 0 && (
          <ContinueWatching items={continueWatchingItems} />
        )}

        {/* Smart Collections */}
        {collections.length > 0 && (
          <SmartCollections collections={collections} />
        )}

        {/* Recently Watched */}
        {recentlyWatchedItems.length > 0 && (
          <RecentlyWatched items={recentlyWatchedItems} />
        )}
      </div>
    </div>
  );
}
