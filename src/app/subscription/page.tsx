import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { checkAndUpdateSubscription } from "@/utils/checkSubscription";
import Transaction from "@/models/Transaction";
import SubscriptionDashboardView from "@/components/subscription/SubscriptionDashboardView";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const currentPlan = user.subscriptionPlan || user.subscription?.plan || "Free";
  const paymentStatus = user.subscription?.paymentStatus || "active";
  const userEmail = user.email || session.user.email || "";

  const startDateStr = user.subscription?.startDate
    ? new Date(user.subscription.startDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  const expiryDate = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
    : user.subscription?.expiryDate
    ? new Date(user.subscription.expiryDate).toLocaleDateString()
    : "Lifetime";

  const expTime = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt).getTime()
    : user.subscription?.expiryDate
    ? new Date(user.subscription.expiryDate).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;

  const remainingDays = Math.max(0, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24)));

  const rawTransactions = await Transaction.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  const transactions = rawTransactions.map((tx: any) => ({
    _id: tx._id.toString(),
    planName: tx.planName || "Plan Upgrade",
    amount: tx.amount || 0,
    currency: tx.currency || "INR",
    status: tx.status || "completed",
    paymentId: tx.paymentId || "N/A",
    createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString() : new Date().toISOString(),
  }));

  const plansArray = Object.values(SUBSCRIPTION_PLANS);

  return (
    <SubscriptionDashboardView
      plans={plansArray}
      currentPlan={currentPlan}
      paymentStatus={paymentStatus}
      userEmail={userEmail}
      transactions={transactions}
      startDateStr={startDateStr}
      expiryDate={expiryDate}
      remainingDays={remainingDays}
    />
  );
}
