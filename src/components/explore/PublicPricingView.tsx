"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, Check, Clock, ShieldCheck, Sparkles, Lock, ArrowRight, Star, Zap } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function PublicPricingView() {
  const { t } = useTranslation();
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
      name: t("freePlanTitle"),
      price: "₹0",
      period: t("forever"),
      description: t("qaFeatureDesc"),
      allowance: t("freeAllowance"),
      features: [
        t("feat1QuestionPerDay"),
        t("featBrowsePublicForum"),
        t("featSocialPreview"),
        t("featEarnRewards"),
        t("feat6Languages"),
      ],
      popular: false,
      buttonText: t("freePlanTitle"),
    },
    {
      name: "Bronze",
      price: "₹100",
      period: t("perMonth"),
      description: t("subscriptionFeatureDesc"),
      allowance: t("bronzeAllowance"),
      features: [
        t("feat5QuestionsPerDay"),
        t("featPhotoVideoUpload"),
        t("featExpandedPostLimits"),
        t("featPriorityVisibility"),
        t("featPdfInvoices"),
      ],
      popular: true,
      buttonText: t("subscribeBtn"),
    },
    {
      name: "Silver",
      price: "₹300",
      period: t("perMonth"),
      description: t("subscriptionFeatureDesc"),
      allowance: t("silverAllowance"),
      features: [
        t("feat10QuestionsPerDay"),
        t("feat10MbMediaUpload"),
        t("featHighPriorityRanking"),
        t("featP2pTransfer"),
        t("featAutomatedBillingLogs"),
      ],
      popular: false,
      buttonText: t("subscribeBtn"),
    },
    {
      name: "Gold",
      price: "₹1000",
      period: t("perMonth"),
      description: t("subscriptionFeatureDesc"),
      allowance: t("goldAllowance"),
      features: [
        t("featUnlimitedQuestions"),
        t("featUnlimitedMediaSharing"),
        t("featGoldBadge"),
        t("featFullAuditLogs"),
        t("featRazorpayTestMode"),
      ],
      popular: false,
      buttonText: t("subscribeBtn"),
    },
  ];

  const triggerSubscribeModal = (planName: string) => {
    setSelectedPlanName(planName);
    setShowAuthGateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            💳
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              {t("plansPricing")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {t("choosePlan")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-purple-100 max-w-2xl leading-relaxed">
          {t("subscriptionFeatureDesc")}
        </p>

        {/* Time-Gate Alert Box */}
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-300 shrink-0" />
            <span>
              <strong>10:00 AM - 11:00 AM IST Window:</strong>{" "}
              {isTimeGateOpen ? t("openWindow") : t("timeGateWarning")}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[9px] ${isTimeGateOpen ? "bg-emerald-500 text-white" : "bg-amber-400/30 text-amber-200"}`}>
            {isTimeGateOpen ? t("openWindow") : t("restricted")}
          </span>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-neutral-800 border rounded-2xl p-5 flex flex-col justify-between space-y-4 relative shadow-sm ${
              plan.popular
                ? "border-purple-500 ring-2 ring-purple-500/20"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-full shadow-sm">
                {t("mostPopular")}
              </span>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.name === "Gold" && <Zap className="h-4 w-4 text-amber-500" />}
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {plan.description}
                </p>
              </div>

              <div className="py-2 border-y border-neutral-100 dark:border-neutral-700">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">{plan.price}</span>
                  <span className="text-xs text-neutral-500">{plan.period}</span>
                </div>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-md">
                  {plan.allowance}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => triggerSubscribeModal(plan.name)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                plan.popular
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <ExploreCrossNav currentPath="/pricing" />

      {/* Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>

            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              {t("signInTitle")}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("signInSubtitle")}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="flex-1 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 flex items-center justify-center gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{t("signIn")}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
