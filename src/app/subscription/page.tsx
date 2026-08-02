import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { checkAndUpdateSubscription } from "@/utils/checkSubscription";
import Transaction from "@/models/Transaction";
import SubscriptionDashboardView from "@/components/subscription/SubscriptionDashboardView";

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

  const user = await checkAndUpdateSubscription((session.user as any).id);

  if (!user) {
    redirect("/login");
  }

  const currentPlan = user.subscription?.plan || "Free";
  const paymentStatus = user.subscription?.paymentStatus || "active";
  const userEmail = user.email || session.user.email || "";

  const rawTransactions = await Transaction.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();
  
  // Sanitize transactions list for serializable client state passing
  const transactions = rawTransactions.map((tx: any) => ({
    _id: tx._id.toString(),
    planName: tx.planName,
    amount: tx.amount,
    currency: tx.currency,
    paymentId: tx.paymentId,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
  }));

  const expiryDateObj = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
  const startDateObj = user.subscription?.startDate ? new Date(user.subscription.startDate) : null;

  const expiryDate = expiryDateObj
    ? expiryDateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Lifetime";

  const startDateStr = startDateObj
    ? startDateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  let remainingDays = 0;
  if (expiryDateObj) {
    const diffTime = expiryDateObj.getTime() - Date.now();
    remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

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
    <SubscriptionDashboardView
      currentPlan={currentPlan}
      paymentStatus={paymentStatus}
      userEmail={userEmail}
      transactions={transactions}
      startDateStr={startDateStr}
      expiryDate={expiryDate}
      remainingDays={remainingDays}
      plans={plans}
    />
  );
}
