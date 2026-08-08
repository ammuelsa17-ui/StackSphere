"use client";

import React, { useState } from "react";
import { X, CreditCard, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    priceINR?: number;
    priceUSD?: number;
    description: string;
    features: string[];
  };
  userEmail: string;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  plan,
  userEmail,
  onSuccess,
}: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const displayPrice = plan.priceINR ?? plan.priceUSD ?? 100;

  // Helper script loader for Razorpay checkout.js
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Load Razorpay SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay payment SDK. Please check your internet connection.");
      }

      // 2. Call Payment Checkout API to create Razorpay Order
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: plan.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment checkout.");
      }

      // 3. Configure Razorpay Options
      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "StackSphere",
        description: `${plan.name} Plan Membership Upgrade`,
        image: "/logo.png",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // 4. Send Razorpay response for backend verification
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                transactionId: data.transactionId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setIsSuccess(true);
            setIsLoading(false);

            if (onSuccess) {
              setTimeout(() => {
                onSuccess();
              }, 1200);
            }
          } catch (verifyErr: any) {
            setError(verifyErr.message || "Payment verification failed.");
            setIsLoading(false);
          }
        },
        prefill: {
          email: userEmail,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpayWindow = new (window as any).Razorpay(options);
      razorpayWindow.open();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Upgrade to {plan.name}</h3>
              <p className="text-xs text-slate-400">Secure Payment Checkout via Razorpay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-6 text-center space-y-5">
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Subscription Activated!</h4>
              <p className="text-sm text-slate-300">
                You have successfully upgraded to the <strong>{plan.name} Plan</strong>. PDF invoice has been emailed to {userEmail}.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="/dashboard"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md text-center transition-all"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/dashboard?action=ask"
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl text-center transition-all"
                >
                  Ask a Question
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{plan.name} Membership (Monthly)</span>
                  <span className="font-bold text-white">₹{displayPrice} / mo</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                  <span>Payment Gateway</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Test Mode
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Opening Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to Pay ₹{displayPrice}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Razorpay Test Payment
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
