import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { User as UserIcon, ShieldAlert, Award, Star, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard - StackSphere",
  description: "Your StackSphere personal dashboard and statistics overview.",
};

export default async function DashboardPage() {
  // Retrieve the server session using authOptions
  const session = await getServerSession(authOptions);

  // Redirect to login page if unauthorized
  if (!session || !session.user) {
    redirect("/login");
  }

  // Connect to MongoDB
  await connectToDatabase();

  // Find user data to get real-time points, plan, and joined date
  const userData = await User.findById((session.user as any).id);

  if (!userData) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold font-sans">
          Welcome back, {userData.name}!
        </h1>
        <p className="mt-2 text-indigo-100 max-w-xl">
          Here is your StackSphere community overview. Ask questions, share posts, and collect reward points!
        </p>
      </div>

      {/* Grid Layout for Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <Award className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Reward Points
            </p>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {userData.points || 0} pts
            </h3>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Star className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Membership Plan
            </p>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {userData.subscription?.plan || "Free"}
            </h3>
          </div>
        </div>

        {/* Joined Date Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Member Since
            </p>
            <h3 className="text-sm font-bold text-neutral-850 dark:text-neutral-100 mt-2">
              {new Date(userData.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
          </div>
        </div>
      </div>

      {/* Account Info and Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-indigo-600" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Full Name</span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{userData.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Email Address</span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{userData.email}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Phone Number</span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {userData.phoneNumber || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Shortcuts */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-600" />
              Quick Shortcuts
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              View your security logs or modify account settings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login-history"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-700 dark:text-neutral-300"
            >
              View Login History
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl transition-all"
            >
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
