import React from "react";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import PublicFeaturesView from "@/components/explore/PublicFeaturesView";

export const metadata = {
  title: "Platform Features - StackSphere",
  description: "Explore full stack developer features on StackSphere including Q&A, social networking, rewards, multi-language support, and security audit logs.",
};

export default function PublicFeaturesPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 mb-16 md:mb-0">
          <PublicFeaturesView />
        </main>
      </div>
    </div>
  );
}
