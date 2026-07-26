"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import CollectionCarousel from "./CollectionCarousel";
import MyListHeaderAction from "./MyListHeaderAction";
import { Collection } from "./CreateCollectionModal";

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
          <div className="px-4 sm:px-6 md:px-12 lg:px-20 mt-16 text-center">
            <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <Bookmark className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">Your library is empty</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Start adding your favorite movies and TV series or click the <strong className="text-red-500 font-semibold">New Collection</strong> button above to curate your personal watchlist.
            </p>
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
