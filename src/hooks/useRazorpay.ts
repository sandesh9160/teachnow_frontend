"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface UseRazorpayReturn {
  /** Whether the Razorpay script is loaded */
  isLoaded: boolean;
  /** Whether a payment is currently in progress */
  isProcessing: boolean;
  /** Initiate a plan purchase */
  purchasePlan: (planId: number, planName?: string) => Promise<void>;
}

// ─── Script Loader ───────────────────────────────────────────────────────────
let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Failed to load Razorpay SDK"));
    };
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useRazorpay(options?: {
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}): UseRazorpayReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript()
      .then(() => setIsLoaded(true))
      .catch(() => {
        console.error("Razorpay SDK failed to load");
      });
  }, []);

  const purchasePlan = useCallback(
    async (planId: number, planName?: string) => {
      if (isProcessing) return;

      // Ensure script is loaded
      try {
        await loadRazorpayScript();
        setIsLoaded(true);
      } catch {
        toast.error("Payment gateway could not be loaded. Please refresh and try again.");
        return;
      }

      setIsProcessing(true);

      try {
        // Step 1: Create order via our Next.js API route
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: planId }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.status) {
          throw new Error(orderData.message || "Failed to create order");
        }

        const {
          order_id,
          key,
          amount,
          currency,
          plan,
        } = orderData.data || orderData;

        const razorpayKey = key;
        const resolvedPlanName = plan?.name || planName || "Plan";

        if (!order_id || !razorpayKey) {
          throw new Error("Invalid order response from server");
        }

        // Step 2: Open Razorpay checkout
        const rzpOptions: RazorpayOptions = {
          key: razorpayKey,
          amount: amount,
          currency: currency || "INR",
          name: "TeachNow",
          description: `${resolvedPlanName} Subscription`,
          order_id: order_id,
          handler: async (response: RazorpayPaymentResponse) => {
            // Step 3: Verify payment server-side
            try {
              const verifyRes = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_id: planId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.status) {
                toast.success("Payment successful! Your plan has been activated.");
                options?.onSuccess?.();
              } else {
                throw new Error(verifyData.message || "Payment verification failed");
              }
            } catch (verifyError: any) {
              const msg = verifyError?.message || "Payment verification failed";
              toast.error(msg);
              options?.onFailure?.(msg);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: options?.userInfo?.name || "",
            email: options?.userInfo?.email || "",
            contact: options?.userInfo?.phone || "",
          },
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.info("Payment was cancelled");
            },
          },
        };

        const rzp = new window.Razorpay(rzpOptions);

        rzp.on("payment.failed", (response: any) => {
          setIsProcessing(false);
          const errorMsg =
            response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again.";
          toast.error(errorMsg);
          options?.onFailure?.(errorMsg);
        });

        rzp.open();
      } catch (error: any) {
        setIsProcessing(false);
        const msg = error?.message || "Something went wrong";
        toast.error(msg);
        options?.onFailure?.(msg);
      }
    },
    [isProcessing, options]
  );

  return { isLoaded, isProcessing, purchasePlan };
}
