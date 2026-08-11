"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Award,
  Globe,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

interface QuestionItem {
  id: string;
  title: string;
  body: string;
  tags: string[];
  votesCount: number;
  answersCount: number;
  viewsCount: number;
  author: {
    name: string;
    avatarUrl: string;
    subscription: string;
  };
  createdAt: string;
}

interface HomeViewProps {
  session: any;
  userDetails: any;
  recentQuestions: QuestionItem[];
}

export default function HomeView({
  session,
  userDetails,
  recentQuestions,
}: HomeViewProps) {
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // AUTHENTICATED USER VIEW
  // ---------------------------------------------------------------------------
  if (session?.user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome Back
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hello, {session.user.name || "Developer"} 👋
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-1">
                  Here is your community snapshot and recent developer discussions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  <PlusCircle className="w-4 h-4" /> {t("askQuestion")}
                </Link>
                <Link
                  href="/social"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-all"
                >
                  <Users className="w-4 h-4" /> {t("socialSpace")}
                </Link>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-medium text-slate-400">{t("myReputationPoints")}</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">
                  {userDetails?.points ?? 0} pts
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-medium text-slate-400">{t("activePlanLabel")}</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {userDetails?.subscription?.plan || "Free"} Plan
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-medium text-slate-400">{t("friendsNetwork")}</p>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {userDetails?.friends?.length || 0} Friends
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-medium text-slate-400">{t("viewSecurityLogs")}</p>
                <Link
                  href="/login-history"
                  className="text-sm font-semibold text-indigo-400 hover:underline mt-1 inline-block"
                >
                  {t("viewSecurityLogs")} →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Q&A Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> {t("questionsTitle")}
              </h2>
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t("qaForum")} →
              </Link>
            </div>

            {recentQuestions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-8 text-center">
                <p className="text-slate-400 text-sm">No community questions found yet.</p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:underline"
                >
                  {t("askQuestion")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl p-5 transition-all shadow-sm group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Link
                        href={`/dashboard?q=${q.id}`}
                        className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {q.title}
                      </Link>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {q.createdAt}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{q.body}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
                      <div className="flex flex-wrap items-center gap-2">
                        {q.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-md bg-slate-700/60 text-slate-300 font-mono text-[11px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-slate-400">
                        <span>{q.votesCount} votes</span>
                        <span>{q.answersCount} answers</span>
                        <span>{q.viewsCount} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PUBLIC MARKETING LANDING PAGE VIEW (UNAUTHENTICATED)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Sparkles className="w-4 h-4" /> {t("developerEcosystem")}
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Learn. Ask. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Connect.</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              StackSphere is a modern developer community platform combining Q&A knowledge sharing,
              social networking, reward points, multi-language support, and flexible subscription memberships.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {t("createAccount")} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/explore/questions"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                {t("qaCommunity")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 sm:py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              {t("platformFeatures")}
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Built from the ground up for collaborative learning, social sharing, and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t("qaCommunity")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ask technical questions, submit verified answers, and upvote quality contributions to build community knowledge.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t("socialSpace")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect with developer friends, share photos/videos via Cloudinary, and post updates with friend-based posting limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t("rewardsSystem")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Earn +5 points per answer, +5 bonus for 5 upvotes, track reputation on your profile, and transfer points securely.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Six Languages Supported</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Switch seamlessly between English, Spanish, Hindi, Portuguese, Chinese & French with OTP verification rules.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t("accountSecurityGroup")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Chrome Email OTP challenge, Edge direct login, mobile time window rules, and detailed login audit logs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-6 sm:p-8 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{t("plansPricing")}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Free (1/day), Bronze ₹100 (5/day), Silver ₹300 (10/day), Gold ₹1000 (unlimited) with Razorpay Test Mode integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t("signUpTitle")}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            {t("signUpSubtitle")}
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-600/30"
            >
              {t("createAccount")} <CheckCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
