"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, PlusCircle, MessageSquare, Eye, Tag, Sparkles, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";

interface PublicQuestion {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  answersCount: number;
  views: number;
  createdAt: string;
  authorName: string;
}

interface PublicQuestionsViewProps {
  initialQuestions: PublicQuestion[];
}

export default function PublicQuestionsView({ initialQuestions }: PublicQuestionsViewProps) {
  const { t } = useTranslation();
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("ask a question");

  const triggerAuthGate = (actionName: string) => {
    setAuthGateAction(actionName);
    setShowAuthGateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            💬
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              {t("qaCommunity")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              {t("questionsTitle")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
          {t("qaFeatureDesc")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => triggerAuthGate("ask a new question")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-50 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t("askQuestion")}</span>
          </button>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-900/50 hover:bg-indigo-900/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            <span>{t("createAccount")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Plan Question Allowances Overview Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            {t("plansPricing")}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 block">{t("freePlanTitle")}</span>
            <span className="text-neutral-500">1 question / day</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <span className="font-bold text-amber-800 dark:text-amber-300 block">Bronze ₹100</span>
            <span className="text-amber-600 dark:text-amber-400">5 questions / day</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Silver ₹300</span>
            <span className="text-slate-600 dark:text-slate-400">10 questions / day</span>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
            <span className="font-bold text-yellow-800 dark:text-yellow-300 block">Gold ₹1000</span>
            <span className="text-yellow-600 dark:text-yellow-400">Unlimited / day</span>
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {initialQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
            <HelpCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-700 dark:text-neutral-300">{t("noNotifications")}</h3>
            <p className="text-xs text-neutral-400 mt-1">{t("createAccountFooterDesc")}</p>
          </div>
        ) : (
          initialQuestions.map((q) => (
            <div
              key={q._id}
              className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl space-y-3 hover:border-indigo-400 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{q.authorName}</span>
                <span>{q.createdAt}</span>
              </div>

              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white line-clamp-2">
                {q.title}
              </h3>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                {q.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700/60 text-xs">
                <div className="flex gap-1.5">
                  {q.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-md font-mono text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {q.answersCount} answers
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {q.views} views
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerAuthGate("answer this question")}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {t("submitAnswer")} →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ExploreCrossNav currentPath="/explore/questions" />

      {/* Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mx-auto">
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
                className="flex-1 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-1"
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
