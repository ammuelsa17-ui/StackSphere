"use client";

import React from "react";
import Link from "next/link";
import { User as UserIcon, ShieldAlert, Award, Star, Calendar, ArrowRight, Activity, HelpCircle, MessageSquare } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

interface DashboardViewProps {
  user: {
    name: string;
    email: string;
    points: number;
    plan: string;
    dailyLimit: number | string;
    questionsTodayCount: number;
    remaining: number | string;
    limitReached: boolean;
  };
}

export default function DashboardView({ user }: DashboardViewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold font-sans">
          {t("welcomeBackUser", { name: user.name })}
        </h1>
        <p className="mt-2 text-indigo-100 max-w-xl">
          {t("dashboardOverviewText")}
        </p>
      </div>

      {/* Question Allowance Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          user.limitReached
            ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200"
            : "bg-indigo-50/70 border-indigo-100 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
            <Star className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-80">
              {t("dailyQuestionAllowancePlan", { plan: user.plan })}
            </p>
            <p className="text-sm font-bold mt-0.5">
              {user.limitReached ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {t("dailyQuestionLimitReached", { used: user.questionsTodayCount, limit: user.dailyLimit })}
                </span>
              ) : (
                <span>
                  {t("questionsTodayCountText", {
                    used: user.questionsTodayCount,
                    limit: user.dailyLimit === "Unlimited" ? t("unlimitedQuestions") : user.dailyLimit,
                    remaining: user.remaining === "Unlimited" ? t("unlimitedQuestions") : user.remaining,
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/subscription"
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          {t("upgradePlanBtn")}
        </Link>
      </div>

      {/* Grid Layout for Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Usage Card */}
        <Link
          href="/subscription"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("questionsTodayLabel")}
            </p>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {user.questionsTodayCount} / {user.dailyLimit === "Unlimited" ? t("unlimitedQuestions") : user.dailyLimit}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {user.remaining === "Unlimited"
                ? t("unlimitedQuestions")
                : t("remainingSuffix", { remaining: user.remaining })}
            </p>
          </div>
        </Link>

        {/* Reputation Points Card */}
        <Link
          href="/explore/rewards"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("rewardPointsLabel")}
            </p>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {user.points}
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 flex items-center gap-1">
              {t("viewReputation")} <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>

        {/* Membership Tier Card */}
        <Link
          href="/subscription"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("membershipPlanLabel")}
            </p>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {user.plan}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
              {t("manageMembership")} <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>

        {/* Login Security Logs Card */}
        <Link
          href="/login-history"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldAlert className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("securityAuditTitle")}
            </p>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {t("viewLoginHistory")}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              {t("auditLogs")} <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>
      </div>

      {/* Account Details & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-indigo-600" />
            {t("accountInformation")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
                {t("fullNameLabel")}
              </span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-base mt-0.5 block">
                {user.name}
              </span>
            </div>
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
                {t("emailAddressLabel")}
              </span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-base mt-0.5 block">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">
            {t("quickShortcuts")}
          </h2>
          <div className="space-y-2">
            <Link
              href="/questions"
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors group"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                {t("exploreQuestions")}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/social"
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors group"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-violet-600" />
                {t("socialSpace")}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors group"
            >
              <span className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-emerald-600" />
                {t("profile")}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
