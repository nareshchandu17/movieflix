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
