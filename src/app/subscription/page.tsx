import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { HelpCircle, AlertCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import SubscriptionPlanGrid from "@/components/subscription/SubscriptionPlanGrid";

export const metadata = {
  title: "Subscription Plans - StackSphere",
  description: "Upgrade your StackSphere membership to unlock advanced features, premium upload sizes, and higher daily post limits.",
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  await connectToDatabase();

  const user = await User.findById((session.user as any).id).select("subscription name email").lean();

  if (!user) {
    redirect("/login");
  }

  const currentPlan = user.subscription?.plan || "Free";
  const paymentStatus = user.subscription?.paymentStatus || "active";
  const userEmail = user.email || session.user.email || "";
  
  const expiryDate = user.subscription?.expiryDate
    ? new Date(user.subscription.expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Lifetime";

  const plans = [
    {
      name: "Free",
      price: "$0",
      priceUSD: 0,
      period: "forever",
      description: "Essential Q&A features for developers getting started.",
      features: [
        "1 question post per day",
        "Standard community Q&A access",
        "Basic profile personalization",
        "No image or video uploads allowed",
      ],
      cta: "Current Plan",
      badge: null,
      color: "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900",
      buttonStyle: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-default",
    },
    {
      name: "Bronze",
      price: "$5",
      priceUSD: 5,
      period: "month",
      description: "Perfect for active developers seeking occasional media uploads.",
      features: [
        "5 question posts per day",
        "Priority community support",
        "Image uploads up to 5MB",
        "Bronze badge on your profile",
      ],
      cta: "Upgrade to Bronze",
      badge: "Popular Starter",
      color: "border-amber-200 dark:border-amber-900/35 bg-white dark:bg-neutral-900 shadow-sm",
      buttonStyle: "bg-amber-600 hover:bg-amber-500 text-white shadow-sm hover:shadow transition-all duration-250 cursor-pointer",
    },
    {
      name: "Silver",
      price: "$15",
      priceUSD: 15,
      period: "month",
      description: "Our recommended choice for professional content creators.",
      features: [
        "10 question posts per day",
        "High-priority response times",
        "Image & video uploads up to 10MB",
        "Silver badge on your profile",
        "Completely ad-free browsing",
      ],
      cta: "Upgrade to Silver",
      badge: "Most Popular",
      color: "border-indigo-500 dark:border-indigo-400/80 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-indigo-950/10 dark:via-neutral-900 dark:to-neutral-900 shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 scale-[1.02]",
      buttonStyle: "bg-indigo-650 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-250 cursor-pointer",
    },
    {
      name: "Gold",
      price: "$29",
      priceUSD: 29,
      period: "month",
      description: "Ultimate power for teams, experts, and enterprise contributors.",
      features: [
        "Unlimited question posts",
        "VIP dedicated live-chat support",
        "Advanced media uploads up to 20MB",
        "Gold badge on your profile",
        "Exclusive premium profile themes",
      ],
      cta: "Upgrade to Gold",
      badge: "Ultimate Power",
      color: "border-violet-300 dark:border-violet-900/40 bg-white dark:bg-neutral-900 shadow-sm",
      buttonStyle: "bg-violet-650 hover:bg-violet-600 text-white shadow-sm hover:shadow transition-all duration-250 cursor-pointer",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header section with page title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/25 border border-indigo-200 dark:border-indigo-850 rounded-full">
          <Sparkles className="h-3 w-3" />
          <span>Membership & Benefits</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Flexible Plans for Every Developer
        </h1>
        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Unlock premium media upload sizes, custom badges, ad-free browsing, and higher daily question limits to make the most of your StackSphere experience.
        </p>
      </div>

      {/* Current Active Plan Status Bar */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Your Current Status
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-neutral-850 dark:text-neutral-100">
                {currentPlan} Membership
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 rounded-full capitalize">
                {paymentStatus}
              </span>
            </div>
            {currentPlan !== "Free" && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your membership is valid until <strong className="font-semibold">{expiryDate}</strong>.
              </p>
            )}
          </div>
        </div>
        {currentPlan === "Free" ? (
          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-550">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Select one of the premium plans below to upgrade instantly.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4 shrink-0 animate-bounce" />
            <span>You have premium privileges enabled!</span>
          </div>
        )}
      </div>

      {/* Subscription Plan Grid Client Component */}
      <SubscriptionPlanGrid
        plans={plans}
        currentPlan={currentPlan}
        userEmail={userEmail}
      />

      {/* Bottom informational card */}
      <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-250/50 dark:border-amber-900/30 rounded-2xl p-5 md:p-6 flex gap-4 items-start max-w-4xl mx-auto">
        <AlertCircle className="h-5 w-5 text-amber-550 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-200">
            About Subscription & Limits Management
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Daily question limits are reset at midnight server time. Premium privileges (image/video file uploads) are verified dynamically before storage processing. Payment transaction details will be documented and invoiced in full compliance with developer guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
