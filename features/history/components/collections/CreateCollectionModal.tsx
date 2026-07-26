"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Check, AlertCircle, Bookmark } from "lucide-react";
import { validateCollectionName, MAX_COLLECTION_NAME_LENGTH } from "@/features/history/schemas/collection-validation";

export interface Collection {
  _id: string;
  name: string;
  itemCount?: number;
  previewItems?: string[];
  items?: unknown[];
  userId?: string;
}

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (collection: Collection) => void;
  existingNames: string[];
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreated,
  existingNames,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset state and autofocus when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setIsTouched(false);
      setIsSubmitting(false);
      setServerError(null);
      setSuccess(false);
      submittingRef.current = false;

      // Reliable autofocus with brief delay for portal/animation mount
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 60);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key and keyboard focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap within modal
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Real-time instant validation
  const validation = validateCollectionName(name, existingNames);
  // Show error instantly if user has touched the input OR typed characters
  const activeError = (isTouched || name.length > 0) ? (validation.error || serverError) : serverError;
  const canSubmit = validation.isValid && !isSubmitting && !success;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setServerError(null);
    if (!isTouched && e.target.value.length > 0) {
      setIsTouched(true);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    setServerError(null);

    if (!validation.isValid || isSubmitting || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

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
          throw new Error("Your session has expired. Please sign in again.");
        }
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${response.status}): Failed to create collection.`);
      }

      const data = await response.json();
      if (!data || !data.collection) {
        throw new Error("Unexpected server response while creating collection.");
      }

      setSuccess(true);

      // Brief visual celebration before closing and triggering immediate UI update
      setTimeout(() => {
        submittingRef.current = false;
        setIsSubmitting(false);
        onCreated(data.collection);
        onClose();
      }, 350);

    } catch (err: any) {
      clearTimeout(timeoutId);
      submittingRef.current = false;
      setIsSubmitting(false);

      if (err.name === "AbortError") {
        setServerError("Request timed out after 10 seconds. Please check your connection.");
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        setServerError("Network error: Unable to connect to server. Check your connection.");
      } else {
        setServerError(err.message || "An unexpected error occurred while creating collection.");
      }
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => !isSubmitting && onClose()}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden bg-gradient-to-b from-zinc-900 via-black to-black border border-white/15 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.2),0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
      >
        {/* Subtle decorative top red glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <Bookmark className="w-5 h-5 fill-red-500/20" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-white tracking-tight">
                Create Collection
              </h2>
              <p id="modal-description" className="text-xs text-gray-400">
                Curate movies & series in your personal library
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 active:scale-95 p-2 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="collection-name-input"
                className="font-semibold text-gray-300 tracking-wide uppercase text-[11px]"
              >
                Collection Name
              </label>
              <span
                className={`transition-colors ${
                  name.length >= MAX_COLLECTION_NAME_LENGTH
                    ? "text-red-400 font-bold"
                    : "text-gray-400"
                }`}
                aria-live="polite"
              >
                {name.length}/{MAX_COLLECTION_NAME_LENGTH}
              </span>
            </div>

            {/* Field Container - Clicking anywhere focuses input */}
            <div
              onClick={handleContainerClick}
              className={`relative rounded-xl transition-all duration-200 bg-black/60 border ${
                activeError
                  ? "border-red-500/80 ring-2 ring-red-500/30"
                  : "border-white/15 hover:border-white/30 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/40"
              }`}
            >
              <input
                ref={inputRef}
                id="collection-name-input"
                type="text"
                maxLength={MAX_COLLECTION_NAME_LENGTH}
                value={name}
                onChange={handleInputChange}
                onBlur={() => setIsTouched(true)}
                disabled={isSubmitting || success}
                placeholder="e.g. Weekend Binge, Sci-Fi Masterpieces"
                aria-invalid={!!activeError}
                aria-describedby={activeError ? "collection-name-error" : undefined}
                className="w-full px-4 py-3 rounded-xl bg-transparent text-white text-sm placeholder:text-gray-500 caret-red-500 cursor-text focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed selection:bg-red-600 selection:text-white"
              />
            </div>

            {/* Instant Validation Feedback & Error Messages */}
            <div className="min-h-[20px] pt-1">
              <AnimatePresence mode="wait">
                {activeError ? (
                  <motion.div
                    key="error-msg"
                    id="collection-name-error"
                    role="alert"
                    aria-live="polite"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{activeError}</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint-msg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-gray-400 px-1"
                  >
                    Use 4 to 60 characters without duplicate names.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 active:scale-98 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-98 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Creating...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 text-green-300 shrink-0 stroke-[3]" />
                  <span>Created!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>Create Collection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
