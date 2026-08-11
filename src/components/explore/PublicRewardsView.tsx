"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Award, Send, ArrowUpRight, ArrowDownRight, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function PublicRewardsView() {
  const { t } = useTranslation();
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            🏆
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              {t("rewardsSystem")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {t("rewardsSystem")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
          {t("rewardsFeatureDesc")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-50 shadow-md transition-all"
          >
            <span>{t("createAccount")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setShowAuthGateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-950/50 hover:bg-amber-950/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>{t("transferPoints")}</span>
          </button>
        </div>
      </div>

      {/* Point Earning Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">
            +5
          </div>
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
            {t("submitAnswerBtn")}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {t("rewardsFeatureDesc")}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-lg">
            +5
          </div>
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
            {t("upvote")}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {t("rewardsFeatureDesc")}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <Send className="h-5 w-5" />
          </div>
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
            {t("pointsTransfer")}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {t("pointsTransferSuccess")}
          </p>
        </div>
      </div>

      <ExploreCrossNav currentPath="/explore/rewards" />

      {/* Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto">
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
                className="flex-1 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 flex items-center justify-center gap-1"
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
