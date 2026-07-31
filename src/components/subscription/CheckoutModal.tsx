"use client";

import React, { useState } from "react";
import { X, CreditCard, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    priceUSD: number;
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
  const [cardName, setCardName] = useState("Developer Account");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call Payment Checkout API
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: plan.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment checkout.");
      }

      // 2. Simulate payment processing delay (Stripe checkout redirection simulation)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Call Verification endpoint to update active user subscription details in DB
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.sessionId }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      setIsSuccess(true);
      setIsLoading(false);

      if (onSuccess) {
        onSuccess();
      }

      // Close modal after brief success presentation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Secure Checkout</span>
          </div>
          <h3 className="text-2xl font-extrabold font-sans">
            Upgrade to {plan.name} Plan
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {plan.description}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Payment Successful!
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your membership has been upgraded to <strong>{plan.name}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3.5 rounded-xl flex items-start gap-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>{plan.name} Subscription (Monthly)</span>
                  <span>${plan.priceUSD}.00</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700/60 pb-3">
                  <span>Account Email</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">{userEmail}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-neutral-900 dark:text-white pt-1">
                  <span>Total Amount Due</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${plan.priceUSD}.00 USD</span>
                </div>
              </div>

              {/* Payment Method Inputs (Stripe Developer Mock Mode) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    <span>Card Information</span>
                  </label>
                  <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 py-0.5 px-2 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                    Stripe Test Mode
                  </span>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Pay Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay ${plan.priceUSD}.00 USD</span>
                  </>
                )}
              </button>

              {/* Security reassurance footer */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>256-bit SSL encrypted connection • Developer sandbox environment</span>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
