/**
 * @file app/see-all/SeeAllClient.tsx
 * @description Client-side See All & Infinite Scroll grid for deep browsing across any Content Strategy.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import MediaCard from "@/features/home/components/newpopular/MediaCard";
import { NormalizedMediaItem, StrategyName } from "@/services/content-engine/types";

export default function SeeAllClient() {
  const searchParams = useSearchParams();
  const strategy = (searchParams?.get("strategy") || "trending") as StrategyName;
  const title = searchParams?.get("title") || "Explore Content";

  const [items, setItems] = useState<NormalizedMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (pageNumber: number, isInitial: boolean = false) => {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetch("/api/content-engine/see-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy,
            page: pageNumber,
            limit: 24,
          }),
        });

        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();

        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setItems((prev) => (isInitial ? data.items : [...prev, ...data.items]));
          if (data.items.length < 12) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("[SeeAllClient] Error loading page:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [strategy]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [strategy, fetchPage]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, false);
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="p-2.5 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 transition-colors text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-red-500 animate-pulse" />
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md leading-tight">
                  {title}
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mt-3 font-medium leading-relaxed">
                Deep exploration across all quality-filtered recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-full aspect-[2/3] rounded-xl bg-gray-800/60 animate-pulse border border-gray-700/30"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/40 rounded-2xl border border-gray-800">
            <p className="text-lg text-gray-400 font-semibold">No recommendations found matching this strategy.</p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {items.map((item, idx) => (
              <div key={`${item.mediaType}-${item.id}-${idx}`} className="transform transition-transform duration-300 hover:z-20">
                <MediaCard
                  media={item as any}
                  index={idx}
                />
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger / Spinner */}
        {hasMore && !loading && (
          <div ref={loaderRef} className="py-12 flex justify-center items-center">
            {loadingMore && (
              <div className="flex items-center gap-3 text-gray-400 font-medium">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span>Loading more recommendations...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
