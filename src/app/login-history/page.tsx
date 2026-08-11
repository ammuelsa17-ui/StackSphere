import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import LoginHistory from "@/models/LoginHistory";
import LoginHistoryView from "@/components/profile/LoginHistoryView";

export const metadata = {
  title: "Login History - StackSphere",
  description: "View details of your account login sessions and security activity.",
};

export default async function LoginHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 5;
  const skip = (page - 1) * limit;

  await connectToDatabase();

  const userId = (session.user as any).id;
  const total = await LoginHistory.countDocuments({ userId });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Fetch paginated logins
  const rawLogins = await LoginHistory.find({ userId })
    .sort({ loginTime: -1 })
    .skip(skip)
    .limit(limit);

  const plainLogins = rawLogins.map((doc) => ({
    _id: doc._id.toString(),
    loginTime: doc.loginTime.toISOString(),
    ipAddress: doc.ipAddress || "127.0.0.1",
    deviceType: doc.deviceType || "Desktop",
    browser: doc.browser || "Chrome",
    os: doc.os || "macOS",
  }));

  return (
    <LoginHistoryView
      logins={plainLogins}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
