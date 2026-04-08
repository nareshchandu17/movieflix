"use client";

import React, { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CreateCollectionFormProps {
  onCancel: () => void;
  onCreated: (collection: any) => void;
}

const CreateCollectionForm: React.FC<CreateCollectionFormProps> = ({
  onCancel,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (name.length > 60) {
      setError("Name must be less than 60 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection");
      }

      onCreated(data.collection);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border-t border-white/10"
    >
      <h3 className="text-white text-sm font-semibold mb-3">Create New Collection</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            autoFocus
            type="text"
            placeholder="Collection Name (e.g. Weekend Binge)"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            disabled={isSubmitting}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-500"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateCollectionForm;
