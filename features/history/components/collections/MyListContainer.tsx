"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import CollectionCarousel from "./CollectionCarousel";
import MyListHeaderAction from "./MyListHeaderAction";
import { Collection } from "./CreateCollectionModal";
import { EmptyState } from "@/components/ui/empty-state";
interface MyListContainerProps {
  initialCollections: unknown[];
}

export default function MyListContainer({ initialCollections }: MyListContainerProps) {
  const [collections, setCollections] = useState<any[]>(initialCollections);

  // Sync state if server component re-fetches via router.refresh()
  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  const handleCollectionCreated = (newCollection: Collection) => {
    const formattedCollection = {
      ...newCollection,
      items: newCollection.items || [],
      previewItems: newCollection.previewItems || [],
      itemCount: newCollection.itemCount || 0,
    };
    setCollections((prev) => [formattedCollection, ...prev]);
  };

  return (
    <>
      <div className="flex justify-end">
        <MyListHeaderAction
          initialCollectionNames={collections.map((c) => c.name)}
          onCollectionCreated={handleCollectionCreated}
        />
      </div>

      {/* Collections Section */}
      <div className="relative z-20 mt-8">
        {collections.length === 0 ? (
          <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-16">
            <EmptyState
              icon={<Bookmark className="h-12 w-12" />}
              title="YOUR LIBRARY IS EMPTY"
              description="Start adding your favorite movies and TV series or click the New Collection button above to curate your personal watchlist."
              action={
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                >
                  Explore Content
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((collection) => (
              <CollectionCarousel
                key={collection._id}
                title={collection.name}
                items={collection.items || []}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
