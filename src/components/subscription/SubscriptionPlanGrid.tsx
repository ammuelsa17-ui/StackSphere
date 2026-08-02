"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap, HelpCircle, AlertCircle } from "lucide-react";
import CheckoutModal from "./CheckoutModal";
import { useTranslation } from "@/components/providers/I18nProvider";

interface PlanConfig {
  name: string;
  price: string;
  priceUSD: number;
  period: string;
  description: string;
  features: string[];
  cta: string;
  badge: string | null;
  color: string;
  buttonStyle: string;
}

interface SubscriptionPlanGridProps {
  plans: PlanConfig[];
  currentPlan: string;
  userEmail: string;
}

export default function SubscriptionPlanGrid({
  plans,
  currentPlan,
  userEmail,
}: SubscriptionPlanGridProps) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bypassGate, setBypassGate] = useState(false);

  // Time Gate check (10:00 AM - 11:00 AM IST)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  const istHour = istTime.getHours();
  const isTimeGateBlocked = istHour !== 10 && !bypassGate;

  const handleOpenCheckout = (plan: PlanConfig) => {
    if (plan.name.toLowerCase() === currentPlan.toLowerCase() || plan.name === "Free") {
      return;
    }
    if (isTimeGateBlocked) {
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <>
      {isTimeGateBlocked && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex justify-between items-center gap-3 text-xs leading-normal">
          <div className="flex gap-2.5 items-center">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <span className="font-bold block">{t("error")}</span>
              {t("timeGateWarning")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBypassGate(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] px-2 py-1 rounded font-bold transition-colors shrink-0 cursor-pointer"
          >
            Bypass for Testing
          </button>
        </div>
      )}

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlan.toLowerCase() === plan.name.toLowerCase();

          return (
            <div
              key={plan.name}
              className={`relative border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md ${plan.color}`}
            >
              {/* Popular / Premium Plan Badge */}
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-sm">
                  {plan.badge}
                </span>
              )}

              {/* Top content */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
                    {plan.name}
                    {isCurrent && (
                      <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-650 dark:text-indigo-400 py-0.5 px-2 rounded-md border border-indigo-100 dark:border-indigo-900/60">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-450 dark:text-neutral-400 mt-2 min-h-8">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 pb-5 border-b border-neutral-100 dark:border-neutral-805">
                  <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-neutral-450 dark:text-neutral-400">
                    / {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Action button */}
              <div className="mt-8 pt-4">
                <button
                  id={`btn-plan-${plan.name.toLowerCase()}`}
                  onClick={() => handleOpenCheckout(plan)}
                  disabled={isCurrent || plan.name === "Free" || isTimeGateBlocked}
                  className={`w-full h-11 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-neutral-100 dark:bg-neutral-805 text-neutral-405 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-750"
                      : plan.name === "Free"
                      ? "bg-neutral-100 dark:bg-neutral-805 text-neutral-405 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-750"
                      : isTimeGateBlocked
                      ? "bg-neutral-100 dark:bg-neutral-805 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-750/50"
                      : plan.buttonStyle
                  }`}
                >
                  {isCurrent ? t("activePlanLabel") : t("subscribeBtn")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={selectedPlan}
          userEmail={userEmail}
        />
      )}
    </>
  );
}
