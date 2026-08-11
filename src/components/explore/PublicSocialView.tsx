"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, Users, Heart, Share2, Image, Video, Sparkles, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function PublicSocialView() {
  const { t } = useTranslation();
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("post updates");

  const triggerAuthGate = (actionName: string) => {
    setAuthGateAction(actionName);
    setShowAuthGateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            🚀
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              {t("socialSpacePreview")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {t("heroTitleLead")} {t("heroTitleGradient")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-pink-100 max-w-2xl leading-relaxed">
          {t("socialFeatureDesc")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => triggerAuthGate("create a post")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 font-bold text-xs rounded-xl hover:bg-pink-50 shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t("postComposerTitle")}</span>
          </button>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-950/50 hover:bg-purple-950/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            <span>{t("joinStackSphere")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Friend-Based Posting Rules Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <ShieldAlert className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            {t("friendsNetwork")}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50">
            <span className="font-bold text-purple-900 dark:text-purple-300 block">0 Friends</span>
            <span className="text-purple-600 dark:text-purple-400">1 post allowed / day</span>
          </div>
          <div className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl border border-pink-200 dark:border-pink-900/50">
            <span className="font-bold text-pink-900 dark:text-pink-300 block">1 - 9 Friends</span>
            <span className="text-pink-600 dark:text-pink-400">5 posts allowed / day</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 block">10+ Friends</span>
            <span className="text-indigo-600 dark:text-indigo-400">Unlimited daily posts</span>
          </div>
        </div>
      </div>

      <ExploreCrossNav currentPath="/explore/social" />

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
