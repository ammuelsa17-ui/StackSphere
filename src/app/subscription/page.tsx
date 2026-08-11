import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { checkAndUpdateSubscription } from "@/utils/checkSubscription";
import Transaction from "@/models/Transaction";
import SubscriptionDashboardView from "@/components/subscription/SubscriptionDashboardView";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

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

  const formattedPlans = SUBSCRIPTION_PLANS.map((plan) => ({
    name: plan.id === "bronze" ? "Bronze" : plan.id === "silver" ? "Silver" : plan.id === "gold" ? "Gold" : "Free",
    id: plan.id,
    nameKey: plan.nameKey,
    price: plan.price,
    priceUSD: plan.id === "bronze" ? 100 : plan.id === "silver" ? 300 : plan.id === "gold" ? 1000 : 0,
    period: plan.periodKey,
    description: plan.descriptionKey,
    features: plan.featureKeys,
    cta: "subscribeBtn",
    badge: plan.badgeKey || null,
    color: plan.popular
      ? "border-indigo-500 dark:border-indigo-400/80 bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-indigo-950/10 dark:via-neutral-900 dark:to-neutral-900 shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-400/20 scale-[1.02]"
      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900",
    buttonStyle: plan.popular
      ? "bg-indigo-650 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-250 cursor-pointer"
      : "bg-neutral-800 hover:bg-neutral-700 text-white shadow-sm transition-all duration-250 cursor-pointer",
  }));

  return (
    <SubscriptionDashboardView
      currentPlan={currentPlan}
      paymentStatus={paymentStatus}
      userEmail={userEmail}
      transactions={transactions}
      startDateStr={startDateStr}
      expiryDate={expiryDate}
      remainingDays={remainingDays}
      plans={formattedPlans}
    />
  );
}
