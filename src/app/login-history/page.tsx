import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import LoginHistory from "@/models/LoginHistory";
import { Shield, Monitor, Smartphone, Tablet, Globe, AlertTriangle } from "lucide-react";

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
  const logins = await LoginHistory.find({ userId })
    .sort({ loginTime: -1 })
    .skip(skip)
    .limit(limit);

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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-550 dark:text-neutral-400">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 dark:divide-neutral-700">
                {logins.map((login, idx) => {
                  // Mark the very first item as Current Session (most recent)
                  const isCurrent = page === 1 && idx === 0;

                  // Simple suspicious alert: if browser or OS is different from the previous chronological log
                  // Since they are sorted descending, the older login is at idx + 1.
                  let isSuspicious = false;
                  if (idx < logins.length - 1) {
                    const olderLogin = logins[idx + 1];
                    isSuspicious = login.browser !== olderLogin.browser || login.deviceType !== olderLogin.deviceType;
                  }

                  return (
                    <tr
                      key={login._id.toString()}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        <div className="space-y-1">
                          <span>
                            {new Date(login.loginTime).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </span>
                          {isCurrent && (
                            <span className="block w-max text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/35 border border-indigo-200 dark:border-indigo-800 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                              Active Session
                            </span>
                          )}
                        </div>
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
                      <td className="px-6 py-4 text-sm">
                        {isSuspicious ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full animate-pulse">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>New Environment</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-550">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-150 dark:border-neutral-700 flex justify-between items-center text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
              Page {page} of {totalPages} ({total} total logs)
            </span>
            <div className="flex gap-2">
              <a
                href={`/login-history?page=${Math.max(1, page - 1)}`}
                className={`px-3.5 py-2 border border-neutral-250 dark:border-neutral-700 rounded-xl font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Previous
              </a>
              <a
                href={`/login-history?page=${Math.min(totalPages, page + 1)}`}
                className={`px-3.5 py-2 border border-neutral-250 dark:border-neutral-700 rounded-xl font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all ${
                  page >= totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
