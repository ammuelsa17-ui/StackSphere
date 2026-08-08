"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Check, Clock, ShieldCheck, Sparkles, Lock, ArrowRight, Star, Zap } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";

export default function PublicPricingView() {
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("Bronze");

  // Calculate live 10:00 AM - 11:00 AM IST Time Gate status
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  const istHour = istTime.getHours();
  const isTimeGateOpen = istHour === 10;

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Essential access for individual developers exploring community Q&A.",
      allowance: "1 Question / Day",
      features: [
        "1 question submission per day",
        "Browse public Q&A forum",
        "Access Social Space preview",
        "Earn community reward points",
        "6 language options",
      ],
      popular: false,
      buttonText: "Current Default Plan",
    },
    {
      name: "Bronze",
      price: "₹100",
      period: "per month",
      description: "Ideal for active developers needing expanded daily question limits.",
      allowance: "5 Questions / Day",
      features: [
        "5 question submissions per day",
        "Photo & video media upload",
        "Expanded social post limits",
        "Priority community visibility",
        "PDF payment invoices",
      ],
      popular: true,
      buttonText: "Sign in to Upgrade",
    },
    {
      name: "Silver",
      price: "₹300",
      period: "per month",
      description: "Designed for power users and senior software engineers.",
      allowance: "10 Questions / Day",
      features: [
        "10 question submissions per day",
        "10MB photo & video uploads",
        "Enhanced reputation bonuses",
        "Advanced login security logs",
        "Full multi-language support",
      ],
      popular: false,
      buttonText: "Sign in to Upgrade",
    },
    {
      name: "Gold",
      price: "₹1000",
      period: "per month",
      description: "Ultimate unlimited access for tech leads and organization teams.",
      allowance: "Unlimited Questions",
      features: [
        "Unlimited daily questions",
        "15MB high-res media uploads",
        "Unlimited social post creation",
        "Custom reputation badge styling",
        "Dedicated developer support",
      ],
      popular: false,
      buttonText: "Sign in to Upgrade",
    },
  ];

  const handlePlanClick = (planName: string) => {
    setSelectedPlanName(planName);
    setShowAuthGateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            💳
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              Public Membership Plans
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Transparent Developer Pricing
            </h1>
          </div>
        </div>

        <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
          Choose the plan that fits your coding workflow. Upgrade anytime to unlock higher daily question allowances, premium media upload limits, and custom reputation badges!
        </p>
      </div>

      {/* Payment Window Time Gate Banner */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isTimeGateOpen
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
          : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
      }`}>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">
              Membership Payment Window: 10:00 AM – 11:00 AM IST Daily
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isTimeGateOpen
                ? "Payment window is currently OPEN. Sign in to process membership upgrades via Razorpay."
                : "Payment window is currently CLOSED. Checkout becomes active daily between 10:00 AM and 11:00 AM IST."}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-white/60 dark:bg-black/30 font-extrabold rounded-lg shrink-0">
          {isTimeGateOpen ? "● Window Open" : "○ Restricted Window"}
        </span>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-neutral-800 rounded-3xl p-6 sm:p-7 border flex flex-col justify-between space-y-6 shadow-sm relative transition-all hover:shadow-md ${
              plan.popular
                ? "border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-neutral-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-xs text-neutral-500">{plan.period}</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 shrink-0" />
                <span>{plan.allowance}</span>
              </div>

              <ul className="space-y-2.5 pt-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handlePlanClick(plan.name)}
              className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                plan.name === "Free"
                  ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Public Explore Cross Navigation */}
      <ExploreCrossNav currentPath="/pricing" />

      {/* Friendly Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Sign in to Upgrade Plan
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Please create an account or sign in before purchasing a {selectedPlanName} membership plan to unlock higher daily question allowances.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-xs font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="w-full py-2 text-center text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mt-1 cursor-pointer"
              >
                Continue Exploring Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
