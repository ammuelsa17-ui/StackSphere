import React from "react";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import PublicPricingView from "@/components/explore/PublicPricingView";

export const metadata = {
  title: "Plans & Pricing - StackSphere",
  description: "Explore StackSphere subscription plans, pricing tiers, and daily question allowances for developers.",
};

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 mb-16 md:mb-0">
          <PublicPricingView />
        </main>
      </div>
    </div>
  );
}
