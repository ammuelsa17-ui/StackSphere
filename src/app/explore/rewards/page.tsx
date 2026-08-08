import React from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import PublicRewardsView from "@/components/explore/PublicRewardsView";

export const metadata = {
  title: "Rewards System - StackSphere",
  description: "Learn how the StackSphere reputation points and community reward system works for developers.",
};

export default function PublicRewardsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 mb-16 md:mb-0">
          <PublicRewardsView />
        </main>
      </div>
    </div>
  );
}
