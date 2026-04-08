"use client";

import { useState, useEffect, useCallback } from "react";
import { ISubscription, IPayment, SubscriptionPlan, PLANS } from "@/types/payment";

// ============================================================
// useSubscription Hook — MovieFlix
// ============================================================

interface SubscriptionData {
  subscription: (ISubscription & { plan: SubscriptionPlan; daysRemaining: number }) | null;
  payments: (IPayment & { amountInRupees: number; plan: SubscriptionPlan })[];
  hasActiveSubscription: boolean;
}

interface UseSubscriptionReturn extends SubscriptionData {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cancelSubscription: () => Promise<{ success: boolean; message?: string; error?: string }>;
  cancelling: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData>({
    subscription: null,
    payments: [],
    hasActiveSubscription: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/payment/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription");

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancelSubscription = useCallback(async () => {
    try {
      setCancelling(true);
      const res = await fetch("/api/payment/subscription", {
        method: "DELETE",
      });

      const json = await res.json();

      if (res.ok) {
        await fetchSubscription(); // Refresh data
        return { success: true, message: json.message };
      } else {
        return { success: false, error: json.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setCancelling(false);
    }
  }, [fetchSubscription]);

  return {
    ...data,
    loading,
    error,
    refetch: fetchSubscription,
    cancelSubscription,
    cancelling,
  };
}
