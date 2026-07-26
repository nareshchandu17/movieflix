"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateCollectionName, MAX_COLLECTION_NAME_LENGTH } from "@/features/history/schemas/collection-validation";

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
  const [isTouched, setIsTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const validation = validateCollectionName(name);
  const activeError = (isTouched || name.length > 0) ? (validation.error || error) : error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    setError(null);

    if (!validation.isValid || isSubmitting || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: validation.cleanName }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to create collection");
      }

      const data = await response.json();
      if (!data || !data.collection) {
        throw new Error("Unexpected server response");
      }

      setSuccess(true);

      setTimeout(async () => {
        submittingRef.current = false;
        setIsSubmitting(false);
        await onCreated(data.collection);
      }, 350);

    } catch (err: any) {
      clearTimeout(timeoutId);
      submittingRef.current = false;
      setIsSubmitting(false);
      if (err.name === "AbortError") {
        setError("Request timed out. Please check your connection.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 border-t border-white/10 space-y-4 bg-black/40"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm font-semibold">
          Create New Collection
        </h3>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer hover:bg-white/10 p-1 rounded transition pointer-events-auto disabled:opacity-40 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            maxLength={MAX_COLLECTION_NAME_LENGTH}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
              if (!isTouched && e.target.value.length > 0) setIsTouched(true);
            }}
            onBlur={() => setIsTouched(true)}
            disabled={isSubmitting || success}
            placeholder="Collection name (Weekend Binge)"
            aria-invalid={!!activeError}
            className={`
              w-full px-3 py-2 rounded-lg
              bg-white/5 border
              text-white text-sm
              cursor-text pointer-events-auto
              focus:outline-none focus:ring-2
              transition-all disabled:opacity-50
              ${activeError ? "border-red-500 ring-red-500/40" : "border-white/10 focus:ring-red-500/50"}
            `}
          />

          <div className="flex justify-between items-center mt-1 text-xs px-0.5">
            <span className="text-gray-400">4–60 characters</span>
            <span className={name.length >= MAX_COLLECTION_NAME_LENGTH ? "text-red-400 font-bold" : "text-gray-400"}>
              {name.length}/{MAX_COLLECTION_NAME_LENGTH}
            </span>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {activeError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-1 font-medium"
              >
                {activeError}
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
            disabled={isSubmitting || !validation.isValid || success}
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
              <Check className="w-4 h-4 text-green-400 stroke-[3]" />
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}