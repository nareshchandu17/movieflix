/**
 * @file useScenes.ts
 * @description Custom React state hook for managing reactive client-side workflows and events.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import useSWR from "swr";
import { Clip, ScenesApiResponse } from "@/lib/scenes/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useScenes(query: string | null) {
  const { data, error, isLoading } = useSWR<ScenesApiResponse>(
    query ? `/api/scenes?q=${encodeURIComponent(query)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute dedup
    }
  );

  return {
    clips: (data?.clips || []) as Clip[],
    isLoading,
    error,
  };
}
