"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, PlusCircle, MessageSquare, Eye, Tag, Sparkles, Lock, ArrowRight, ShieldCheck } from "lucide-react";

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
              Public Q&A Community
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Explore Technical Developer Q&A
            </h1>
          </div>
        </div>

        <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
          Search real programming challenges, learn from community solutions, and discover how StackSphere helps developers collaborate globally!
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => triggerAuthGate("ask a new question")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-50 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ask a Question</span>
          </button>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-900/50 hover:bg-indigo-900/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            <span>Create Account</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Plan Question Allowances Overview Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Daily Question Allowances by Plan Tiers
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-neutral-900 dark:text-white">Free Plan</span>
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">1 Question / Day</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <span className="font-bold text-amber-700 dark:text-amber-400">Bronze ₹100</span>
            <p className="text-amber-600/80 dark:text-amber-400/80 text-[11px] mt-0.5">5 Questions / Day</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Silver ₹300</span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">10 Questions / Day</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
            <span className="font-bold text-indigo-700 dark:text-indigo-400">Gold ₹1000</span>
            <p className="text-indigo-600/80 dark:text-indigo-400/80 text-[11px] mt-0.5">Unlimited Questions</p>
          </div>
        </div>
      </div>

      {/* Questions Preview Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <span>Recent Community Questions</span>
        </h2>

        {initialQuestions.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 text-center space-y-3">
            <p className="text-xs text-neutral-500">No questions found in community stream.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialQuestions.map((q) => (
              <div
                key={q._id}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {q.title}
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-500 shrink-0">
                    {q.authorName}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {q.content.replace(/<[^>]*>?/gm, "")}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{q.answersCount} Answers</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerAuthGate("answer this question")}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Answer Question
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friendly Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Sign in to continue
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Create an account or sign in to {authGateAction}, participate in voting, and unlock custom developer features.
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
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
