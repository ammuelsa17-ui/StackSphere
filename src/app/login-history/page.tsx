import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import LoginHistory from "@/models/LoginHistory";
import { Shield, Monitor, Smartphone, Tablet, Globe } from "lucide-react";

export const metadata = {
  title: "Login History - StackSphere",
  description: "View details of your account login sessions and security activity.",
};

export default async function LoginHistoryPage() {
  // Retrieve the server session using authOptions
  const session = await getServerSession(authOptions);

  // Redirect to login page if unauthorized
  if (!session || !session.user) {
    redirect("/login");
  }

  // Connect to MongoDB
  await connectToDatabase();

  // Fetch the 10 most recent logins for this user
  const logins = await LoginHistory.find({ userId: (session.user as any).id })
    .sort({ loginTime: -1 })
    .limit(10);

  // Helper to resolve appropriate device icons
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "tablet":
        return <Tablet className="h-3.5 w-3.5" />;
      default:
        return <Monitor className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-650" />
          Login Security History
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          This log tracks your recent login sessions including devices, operating systems, and IP locations to help keep your account secure.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
        {logins.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            <Globe className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-350">
              No Login Records Found
            </h3>
            <p className="text-sm mt-1">Your authentication history has not been recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-700 bg-neutral-50/55 dark:bg-neutral-900/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Device Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Browser
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-550 dark:text-neutral-400">
                    OS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 dark:divide-neutral-700">
                {logins.map((login) => (
                  <tr
                    key={login._id.toString()}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {new Date(login.loginTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600 dark:text-neutral-350">
                      {login.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-850 dark:text-neutral-200 rounded-full border border-neutral-200 dark:border-neutral-600">
                        {getDeviceIcon(login.deviceType)}
                        {login.deviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-350">
                      {login.browser}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-350">
                      {login.os}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
