import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import DashboardView from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - StackSphere",
  description: "Your StackSphere personal dashboard and statistics overview.",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  await connectToDatabase();

  const userData = await User.findById((session.user as any).id);

  if (!userData) {
    redirect("/login");
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const Question = (await import("@/models/Question")).default;
  const questionsTodayCount = await Question.countDocuments({
    author: userData._id,
    createdAt: { $gte: startOfToday },
  });

  const plan = userData.subscription?.plan || "Free";
  let dailyLimit: number | string = 1;
  if (plan === "Bronze") dailyLimit = 5;
  else if (plan === "Silver") dailyLimit = 10;
  else if (plan === "Gold") dailyLimit = "Unlimited";

  const remaining = typeof dailyLimit === "number" ? Math.max(0, dailyLimit - questionsTodayCount) : "Unlimited";
  const limitReached = typeof dailyLimit === "number" && questionsTodayCount >= dailyLimit;

  const userProps = {
    name: userData.name || "User",
    email: userData.email || "",
    points: userData.points || 0,
    plan,
    dailyLimit,
    questionsTodayCount,
    remaining,
    limitReached,
  };

  return <DashboardView user={userProps} />;
}
