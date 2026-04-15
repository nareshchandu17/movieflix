"use client";

import React, { useState } from "react";
import { X, Plus, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Collection {
  _id: string;
  name: string;
  itemCount?: number;
}

interface CreateCollectionFormProps {
  onCancel: () => void;
  onCreated: (collection: Collection) => void | Promise<void>;
}

export default function CreateCollectionForm({
  onCancel,
  onCreated,
}: CreateCollectionFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateName = () => {
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    if (trimmed.length > 60) {
      setError("Name must be under 60 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!validateName()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to create collection");
      }

      const data = await response.json();

      setSuccess(true);

      setTimeout(() => {
        onCreated(data.collection);
      }, 600);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 border-t border-white/10 space-y-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm font-semibold">
          Create New Collection
        </h3>

        <button
          onClick={onCancel}
          className="cursor-pointer hover:bg-white/10 p-1 rounded transition pointer-events-auto"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">

          <motion.input
            layout
            autoFocus
            maxLength={60}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            disabled={isSubmitting}
            placeholder="Collection name (Weekend Binge)"
            className={`
              w-full px-3 py-2 rounded-lg
              bg-white/5 border
              text-white text-sm
              cursor-text pointer-events-auto
              focus:outline-none focus:ring-2
              transition-all
              ${error ? "border-red-500 ring-red-500/40" : "border-white/10 focus:ring-red-500/50"}
            `}
          />

          {/* Validation hint */}
          <p className="text-xs text-gray-400 mt-1">
            2–60 characters
          </p>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

        </div>

        {/* Buttons */}
        <div className="flex gap-2">

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg
              bg-white/5 hover:bg-white/10
              text-white text-sm font-medium
              cursor-pointer pointer-events-auto
              transition disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || name.trim().length < 2}
            className="flex-1 px-4 py-2 rounded-lg
              bg-red-600 hover:bg-red-500
              text-white text-sm font-bold
              flex items-center justify-center gap-2
              cursor-pointer pointer-events-auto
              transition disabled:opacity-40"
          >

            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4 text-green-400" />
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
}