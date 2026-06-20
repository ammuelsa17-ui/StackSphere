import React from "react";
import { GET as runTests } from "@/app/api/test-auth/route";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCw, Terminal } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Auth Test Suite - StackSphere",
  description: "Programmatic authentication and session tracking validation logs.",
};

export default async function TestAuthPage() {
  // Execute the test route logic directly on the server side (avoiding port-binding HTTP calls)
  const response = await runTests();
  const testData = await response.json();

  const results = testData.results || [];
  const overallSuccess = testData.status === "success";

  const totalTests = results.length;
  const passedTests = results.filter((r: any) => r.status === "PASS").length;
  const failedTests = results.filter((r: any) => r.status === "FAIL").length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with quick reload button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-905 dark:text-white flex items-center gap-2">
            {overallSuccess ? (
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-red-650" />
            )}
            Authentication E2E Test Suite
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Programmatic assertions verifying registration validation, password hashing, NextAuth credentials logic, and login logs.
          </p>
        </div>
        
        {/* Reload button via server component refresh */}
        <Link
          href="/dashboard/test-auth"
          className="inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all shadow-sm text-neutral-700 dark:text-neutral-350"
        >
          <RotateCw className="h-4 w-4" />
          <span>Re-run Tests</span>
        </Link>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Tests Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Terminal className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Total Test Cases
            </p>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
              {totalTests}
            </h3>
          </div>
        </div>

        {/* Passed Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider">
              Passed Assertions
            </p>
            <h3 className="text-2xl font-bold text-emerald-650 dark:text-emerald-450 mt-1">
              {passedTests}
            </h3>
          </div>
        </div>

        {/* Failed Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider">
              Failed Assertions
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${failedTests > 0 ? "text-red-600 dark:text-red-400" : "text-neutral-400"}`}>
              {failedTests}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Results Listing */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-neutral-150 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Suite Execution Logs
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Executed: {new Date(testData.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="divide-y divide-neutral-150 dark:divide-neutral-700">
          {results.map((res: any, idx: number) => (
            <div
              key={idx}
              className="p-5 md:px-6 flex items-start gap-4 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 transition-colors"
            >
              {res.status === "PASS" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-neutral-850 dark:text-neutral-100">
                    {res.name}
                  </h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    res.status === "PASS"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/30"
                      : "bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-405 border border-red-200/50 dark:border-red-900/30"
                  }`}>
                    {res.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 mt-1">
                  {res.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
