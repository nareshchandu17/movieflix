"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateCollectionModal, { Collection } from "./CreateCollectionModal";
import CollectionToast from "./CollectionToast";

interface MyListHeaderActionProps {
  initialCollectionNames?: string[];
  onCollectionCreated?: (collection: Collection) => void;
}

export default function MyListHeaderAction({
  initialCollectionNames = [],
  onCollectionCreated,
}: MyListHeaderActionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [existingNames, setExistingNames] = useState<string[]>(initialCollectionNames);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean }>({
    message: "",
    isOpen: false,
  });
  const router = useRouter();

  // Sync initialCollectionNames when props change
  useEffect(() => {
    if (initialCollectionNames && initialCollectionNames.length > 0) {
      setExistingNames(initialCollectionNames);
    }
  }, [initialCollectionNames]);

  // Fetch latest collection names whenever the modal opens to guarantee fresh duplicate check
  useEffect(() => {
    if (isCreating) {
      const fetchLatestCollections = async () => {
        try {
          const res = await fetch("/api/collections");
          if (res.ok) {
            const data = await res.json();
            if (data?.success && Array.isArray(data.collections)) {
              const names = data.collections.map((col: any) => col.name);
              setExistingNames(names);
            }
          }
        } catch (err) {
          console.error("Failed to fetch collections for duplicate validation:", err);
        }
      };
      fetchLatestCollections();
    }
  }, [isCreating]);

  const handleCreated = (newCollection: Collection) => {
    // Add to local duplicate tracking immediately
    setExistingNames((prev) => [newCollection.name, ...prev]);

    // Show success toast
    setToast({
      message: `Collection "${newCollection.name}" created successfully!`,
      isOpen: true,
    });

    // Notify client-side view wrapper for instant UI update (no page refresh)
    if (onCollectionCreated) {
      onCollectionCreated(newCollection);
    }

    // Also trigger router.refresh() so server-side data stays perfectly synchronized
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
        aria-label="Create new collection"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>New Collection</span>
      </button>

      <CreateCollectionModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={handleCreated}
        existingNames={existingNames}
      />

      <CollectionToast
        message={toast.message}
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
