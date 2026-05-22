/**
 * @file useRazorpay.ts
 * @description Custom React state hook for managing reactive client-side workflows and events.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import { useState, useCallback } from "react";
import { PlanTier, BillingCycle } from "@/types/payment";

// ============================================================
// useRazorpay Hook — MovieFlix
// Handles complete Razorpay payment flow
// ============================================================

interface UseRazorpayOptions {
  onSuccess?: (data: PaymentSuccessData) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

interface PaymentSuccessData {
  subscriptionId: string;
  paymentId: string;
  planId: PlanTier;
  billingCycle: BillingCycle;
}

type PaymentState = "idle" | "creating" | "processing" | "verifying" | "success" | "error";

interface UseRazorpayReturn {
  state: PaymentState;
  error: string | null;
  initiatePayment: (planId: PlanTier, billingCycle: BillingCycle) => Promise<void>;
  reset: () => void;
}

// ─── Load Razorpay script ─────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function useRazorpay({
  onSuccess,
  onError,
  onDismiss,
}: UseRazorpayOptions = {}): UseRazorpayReturn {
  const [state, setState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  const initiatePayment = useCallback(
    async (planId: PlanTier, billingCycle: BillingCycle) => {
      try {
        setState("creating");
        setError(null);

        // ─── Load Razorpay SDK ──────────────────────────────
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Failed to load payment SDK. Check your connection.");
        }

        // ─── Create order ───────────────────────────────────
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, billingCycle }),
        });

        if (!orderRes.ok) {
          const data = await orderRes.json();
          throw new Error(data.error || "Failed to create order");
        }

        const orderData = await orderRes.json();
        setState("processing");

        // ─── Open Razorpay Checkout ─────────────────────────
        // ─── Open Razorpay Checkout ─────────────────────────
        if (!orderData.key && process.env.NODE_ENV === "development") {
          console.warn("🛠️ Razorpay Key missing. Simulation mode active.");
          
          // Simulate a short delay
          await new Promise(r => setTimeout(r, 1500));
          
          setState("verifying");
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpay_signature: "mock_signature",
              subscriptionId: orderData.subscriptionId,
            }),
          });

          if (!verifyRes.ok) {
            const errData = await verifyRes.json();
            throw new Error(errData.error || "Mock verification failed");
          }

          const verifyData = await verifyRes.json();
          setState("success");
          onSuccess?.({
            subscriptionId: verifyData.subscription.id,
            paymentId: verifyData.paymentId,
            planId,
            billingCycle,
          });
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "MovieFlix",
            description: `${orderData.planName} Plan — ${
              billingCycle === "monthly" ? "Monthly" : "Annual"
            }`,
            image: "/logo.png",
            order_id: orderData.orderId,
            prefill: orderData.prefill,
            theme: {
              color: "#e50914",
              backdrop_color: "rgba(0,0,0,0.85)",
            },
            modal: {
              ondismiss: () => {
                setState("idle");
                onDismiss?.();
                resolve();
              },
              animation: true,
            },
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              try {
                setState("verifying");

                // ─── Verify payment ─────────────────────────
                const verifyRes = await fetch("/api/payment/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...response,
                    subscriptionId: orderData.subscriptionId,
                  }),
                });

                if (!verifyRes.ok) {
                  const errData = await verifyRes.json();
                  throw new Error(errData.error || "Verification failed");
                }

                const verifyData = await verifyRes.json();
                setState("success");

                onSuccess?.({
                  subscriptionId: verifyData.subscription.id,
                  paymentId: verifyData.paymentId,
                  planId,
                  billingCycle,
                });

                resolve();
              } catch (err: any) {
                setState("error");
                const message = err.message || "Payment verification failed";
                setError(message);
                onError?.(message);
                reject(err);
              }
            },
          };

          const rzp = new (window as any).Razorpay(options);

          rzp.on("payment.failed", (response: any) => {
            const message =
              response.error?.description || "Payment failed";
            setState("error");
            setError(message);
            onError?.(message);
            resolve();
          });

          rzp.open();
        });
      } catch (err: any) {
        const message = err.message || "Something went wrong";
        setState("error");
        setError(message);
        onError?.(message);
      }
    },
    [onSuccess, onError, onDismiss]
  );

  return { state, error, initiatePayment, reset };
}
