import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import ProfileCard from "@/components/profile/ProfileCard";
import EditProfileForm from "@/components/profile/EditProfileForm";
import PointsDashboard from "@/components/profile/PointsDashboard";
import PointTransfer from "@/components/rewards/PointTransfer";
import { Activity, MessageSquare, HelpCircle, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { checkAndUpdateSubscription } from "@/utils/checkSubscription";

export const metadata = {
  title: "My Profile - StackSphere",
  description: "View and update your personal StackSphere user profile and activity overview.",
};

export default async function ProfilePage() {
  // 1. Get current user session on the server
  const session = await getServerSession(authOptions);

  // 2. Redirect if guest attempts to access `/profile`
  if (!session || !session.user) {
    redirect("/login");
  }

  // 3. Connect to MongoDB
  await connectToDatabase();

  // 4. Query Mongoose model for fresh user information and check expiration fallback
  const userData = await checkAndUpdateSubscription((session.user as any).id);

  if (!userData) {
    redirect("/login");
  }

  // Convert mongoose doc to lean JS object
  const userObj = {
    id: userData._id.toString(),
    name: userData.name,
    email: userData.email,
    phoneNumber: userData.phoneNumber || "",
    points: userData.points || 0,
    subscription: {
      plan: userData.subscription?.plan || "Free",
    },
    createdAt: userData.createdAt.toISOString(),
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          User Account Profile
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your personal details, review rewards, and monitor account activity stats.
        </p>
      </div>

      {/* Grid: Left Presenter, Right Details Form & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Reusable ProfileCard */}
        <div className="lg:col-span-1">
          <ProfileCard user={userObj} />
        </div>

        {/* Right Column: Edit Profile, Points Dashboard, & Activity Overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Form */}
          <EditProfileForm initialUser={userObj} />

          {/* Day 50: Points Dashboard & Rewards history */}
          <PointsDashboard initialPoints={userObj.points} />

          {/* Day 52: Secure User Points Transfer */}
          <PointTransfer currentBalance={userObj.points} />

          {/* Profile Activity Overview Section Placeholder */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-4">
              <Activity className="h-5 w-5 text-indigo-650" />
              Profile Activity Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Forum activity summary */}
              <div className="border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-4 flex gap-3.5 items-start bg-neutral-50/50 dark:bg-neutral-900/10">
                <HelpCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-neutral-805 dark:text-neutral-200">
                    Q&A Contribution
                  </h4>
                  <p className="text-xs text-neutral-450 dark:text-neutral-500">
                    0 questions posted • 0 answers contributed
                  </p>
                </div>
              </div>

              {/* Social feed activity summary */}
              <div className="border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-4 flex gap-3.5 items-start bg-neutral-50/50 dark:bg-neutral-900/10">
                <MessageSquare className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-neutral-805 dark:text-neutral-200">
                    Social Space Posts
                  </h4>
                  <p className="text-xs text-neutral-450 dark:text-neutral-500">
                    No posts shared yet in the social feed.
                  </p>
                </div>
              </div>
            </div>

            {/* Login security history logs redirect widget */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-neutral-200 dark:border-neutral-700/65 rounded-xl p-4 gap-4 bg-neutral-50/50 dark:bg-neutral-900/10">
              <div className="flex gap-3.5 items-start">
                <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-neutral-805 dark:text-neutral-200">
                    Login History & Security
                  </h4>
                  <p className="text-xs text-neutral-450 dark:text-neutral-500">
                    Keep your account secure by verifying session devices, browsers, and IPs.
                  </p>
                </div>
              </div>
              <Link
                href="/login-history"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View Security Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
