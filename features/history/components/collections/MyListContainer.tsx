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
            <div className="mx-auto w-28 h-28 bg-red-950/20 rounded-full flex items-center justify-center mb-8 border border-red-500/10 shadow-[0_0_40px_rgba(229,9,20,0.1)] relative">
              <div className="absolute inset-0 rounded-full border border-red-500/20 animate-pulse opacity-30" />
              <Bookmark className="w-12 h-12 text-red-500/70" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-white tracking-tight">
              YOUR LIBRARY IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">EMPTY</span>
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-10 text-base leading-relaxed font-medium">
              Start adding your favorite movies and TV series or click the <span className="text-white bg-white/10 px-2 py-0.5 rounded text-sm mx-1 border border-white/10 font-bold">New Collection</span> button above to curate your personal watchlist.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.4)]" onClick={() => window.location.href = '/'}>
              Explore Content
            </button>
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
