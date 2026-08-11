"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare, Award, Globe, ShieldAlert, CreditCard, Image, Bell, Sparkles, ArrowRight, Lock, Key } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function PublicFeaturesView() {
  const { t } = useTranslation();
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

  const featureCards = [
    {
      title: t("qaCommunity"),
      icon: HelpCircle,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
      description: t("qaFeatureDesc"),
      link: "/explore/questions",
    },
    {
      title: t("socialSpace"),
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      description: t("socialFeatureDesc"),
      link: "/explore/social",
    },
    {
      title: t("rewardsSystem"),
      icon: Award,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      description: t("rewardsFeatureDesc"),
      link: "/explore/rewards",
    },
    {
      title: "Six Global Languages",
      icon: Globe,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      description: t("languagesFeatureDesc"),
      link: "/pricing",
    },
    {
      title: t("accountSecurityGroup"),
      icon: Key,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
      description: t("securityFeatureDesc"),
      link: "/login",
    },
    {
      title: t("loginHistory"),
      icon: ShieldAlert,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      description: t("loginHistorySubtitle"),
      link: "/login-history",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            ⚡
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              {t("platformFeatures")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {t("featuresTitle")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
          {t("featuresSubtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50 shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("createAccount")}</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-950/50 hover:bg-emerald-950/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            <span>{t("signIn")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureCards.map((feat) => {
          const Icon = feat.icon;
          return (
            <Link
              key={feat.title}
              href={feat.link}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <ExploreCrossNav currentPath="/explore/features" />
    </div>
  );
}
