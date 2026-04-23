'use client';

import useSWR from 'swr';
import { useProfile } from '@/contexts/ProfileContext';

interface TasteDNAData {
  persona: string;
  summary: string;
  traits: string[];
  personality: string;
  moodDistribution: Array<{ label: string; value: number }>;
  evolution: {
    period: string;
    changes: Array<{ label: string; change: number }>;
  };
  genres: Record<string, number>;
  recommendations: string[];
  lastGenerated: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTasteDNA() {
  const { activeProfile } = useProfile();
  
  const { data, error, isLoading, mutate } = useSWR(
    activeProfile ? `/api/user/taste-dna?profileId=${activeProfile.profileId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute Cache
    }
  );

  return {
    dna: data?.success ? (data.data as TasteDNAData) : null,
    isLoading: isLoading || (activeProfile && !data),
    error: error || (data && !data.success ? data.error : null),
    refresh: () => {
      if (activeProfile) {
        return mutate(fetch(`/api/user/taste-dna?profileId=${activeProfile.profileId}&refresh=true`).then(r => r.json()));
      }
    }
  };
}
