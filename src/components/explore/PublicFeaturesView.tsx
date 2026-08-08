"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare, Award, Globe, ShieldAlert, CreditCard, Image, Bell, Sparkles, ArrowRight, Lock, Key } from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";

export default function PublicFeaturesView() {
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [activeFeatureTitle, setActiveFeatureTitle] = useState("Developer Feature");

  const featureCards = [
    {
      title: "Q&A Community Forum",
      icon: HelpCircle,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
      description: "Ask technical developer questions, post answers, upvote solutions, and enforce daily plan limits.",
      link: "/explore/questions",
    },
    {
      title: "Social Space Feed",
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      description: "Connect with developers, share photos/videos, like, comment, and unlock friend-based posting tiers.",
      link: "/explore/social",
    },
    {
      title: "Reward Points Engine",
      icon: Award,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      description: "Earn reputation points (+5 answer, +5 5-upvote bonus), view history, and transfer points to peers.",
      link: "/explore/rewards",
    },
    {
      title: "Six Global Languages",
      icon: Globe,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      description: "English, Spanish, Hindi, Portuguese, Chinese, and French with OTP security challenge verification.",
      link: "/pricing",
    },
    {
      title: "Secure 2FA & Time Gates",
      icon: Key,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
      description: "Nodemailer Email OTP for Chrome 2FA, Twilio SMS OTP, and 10:00–13:00 IST mobile access restrictions.",
      link: "/login",
    },
    {
      title: "Login History Audit Logs",
      icon: ShieldAlert,
      color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
      description: "Track IP addresses, browser agents, operating systems, and device metadata for every account sign-in.",
      link: "/login",
    },
    {
      title: "Subscription Plans & PDF Invoices",
      icon: CreditCard,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      description: "Free, Bronze ₹100, Silver ₹300, and Gold ₹1000 memberships with automated PDF invoice dispatch.",
      link: "/pricing",
    },
    {
      title: "Cloudinary CDN Media Uploads",
      icon: Image,
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
      description: "Attach high-res photos and videos to social updates with instant Cloudinary CDN URL resolution.",
      link: "/explore/social",
    },
    {
      title: "Real-Time Notification Center",
      icon: Bell,
      color: "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
      description: "Receive instant notifications for answer upvotes, social likes, comments, and friend requests.",
      link: "/register",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            ✨
          </div>
          <div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              Platform Features Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              StackSphere Ecosystem Features
            </h1>
          </div>
        </div>

        <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
          Discover all full-stack capabilities built into StackSphere. From technical Q&A to multi-language translation and security audit logging!
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 shadow-md transition-all"
          >
            <span>Create Account</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-950/50 hover:bg-blue-950/70 border border-white/20 text-white font-bold text-xs rounded-xl transition-all"
          >
            <span>View Pricing</span>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <Link
                href={card.link}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2 border-t border-neutral-100 dark:border-neutral-900"
              >
                <span>Learn More</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Public Explore Cross Navigation */}
      <ExploreCrossNav currentPath="/explore/features" />
    </div>
  );
}
