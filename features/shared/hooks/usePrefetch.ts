/**
 * @file usePrefetch.ts
 * @description Custom React state hook for managing reactive client-side workflows and events.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const usePrefetch = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Prefetch a movie detail page and its data
   */
  const prefetchMovie = (id: number) => {
    // 1. Prefetch Next.js route
    router.prefetch(`/movie/${id}`);

    // 2. Prefetch TMDB data into React Query cache
    queryClient.prefetchQuery({
      queryKey: ["movie", id],
      queryFn: () => api.getDetails("movie", id),
      staleTime: 30 * 60 * 1000, // 30 mins
    });
  };

  /**
   * Prefetch a TV show detail page and its data
   */
  const prefetchTV = (id: number) => {
    // 1. Prefetch Next.js route
    router.prefetch(`/tv/${id}`);

    // 2. Prefetch TMDB data into React Query cache
    queryClient.prefetchQuery({
      queryKey: ["tv", id],
      queryFn: () => api.getDetails("tv", id),
      staleTime: 30 * 60 * 1000, // 30 mins
    });
  };

  return { prefetchMovie, prefetchTV };
};
