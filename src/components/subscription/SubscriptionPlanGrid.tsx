"use client";

import React, { useState } from "react";
import { Check, Sparkles, Zap, HelpCircle } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

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
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCheckout = (plan: PlanConfig) => {
    if (plan.name.toLowerCase() === currentPlan.toLowerCase() || plan.name === "Free") {
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <>
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
                  disabled={isCurrent || plan.name === "Free"}
                  className={`w-full h-11 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-neutral-100 dark:bg-neutral-805 text-neutral-405 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-750"
                      : plan.name === "Free"
                      ? "bg-neutral-100 dark:bg-neutral-805 text-neutral-405 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-750"
                      : plan.buttonStyle
                  }`}
                >
                  {isCurrent ? "Your Current Plan" : plan.cta}
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
