"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import CreateCollectionForm from "./CreateCollectionForm";
import { useRouter } from "next/navigation";

export default function MyListHeaderAction() {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreated = () => {
    setIsCreating(false);
    // Refresh the page data so the new collection shows up immediately
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:scale-105 cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        New Collection
      </button>

      {isCreating && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto px-4">
          <div
            onClick={() => setIsCreating(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
                Create Collection
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCreating(false);
                }}
                className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-2">
              <CreateCollectionForm
                onCancel={() => setIsCreating(false)}
                onCreated={handleCreated}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
