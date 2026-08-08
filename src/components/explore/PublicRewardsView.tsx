"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Award, Send, ArrowUpRight, ArrowDownRight, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";

export default function PublicRewardsView() {
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
              Community Rewards System
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              How StackSphere Rewards Work
            </h1>
          </div>
        </div>

        <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
          The StackSphere reputation system recognizes developers who contribute high-quality technical answers. Earn reputation points, unlock achievement badges, and transfer points to peers!
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-50 shadow-md transition-all"
          >
            <span>Start Earning Points</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setShowAuthGateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-950/50 hover:bg-amber-950/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <span>Transfer Points Rule</span>
          </button>
        </div>
      </div>

      {/* Rewards Calculation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            +5
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Post an Answer</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Earn +5 reputation points immediately when you share a technical answer on any question.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            +5
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Reach 5 Upvotes</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Receive a single-use +5 point bonus when your answer reaches 5 community upvotes.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
            -5
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Downvote / Removal</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Points are safely deducted if an answer is downvoted or deleted by community moderators.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <Send className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Peer Point Transfer</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Transfer points to fellow developers via Mongoose sessions once your balance exceeds 10 pts.
          </p>
        </div>
      </div>

      {/* Purpose Explanation */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Why StackSphere Reputation Exists</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white">1. Encourage Quality Answers</span>
            <p className="text-neutral-500 leading-relaxed">High-reputation answers appear prominently to help developers solve bugs faster.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white">2. Recognize Community Participation</span>
            <p className="text-neutral-500 leading-relaxed">Earn badges like Starter Scholar, Active Contributor, and Grandmaster Developer.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white">3. Peer Transfer Ecosystem</span>
            <p className="text-neutral-500 leading-relaxed">Reward developers directly for providing exceptional mentorship and code snippets.</p>
          </div>
        </div>
      </div>

      {/* Public Explore Cross Navigation */}
      <ExploreCrossNav currentPath="/explore/rewards" />

      {/* Friendly Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                Sign in to Transfer Points
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Create an account or sign in to build your reputation balance and transfer points to other developers.
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
