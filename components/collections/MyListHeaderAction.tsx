"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        New Collection
      </button>

      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  Create Collection
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2 -mx-4 -mb-4">
                <CreateCollectionForm
                  onCancel={() => setIsCreating(false)}
                  onCreated={handleCreated}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
