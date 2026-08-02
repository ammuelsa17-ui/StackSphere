"use client";

import React from "react";
import { HelpCircle, AlertCircle, ShieldCheck, Sparkles, Zap, Clock, Download } from "lucide-react";
import SubscriptionPlanGrid from "./SubscriptionPlanGrid";
import { useTranslation } from "@/components/providers/I18nProvider";

interface TransactionItem {
  _id: string;
  planName: string;
  amount: number;
  currency: string;
  paymentId: string;
  status: string;
  createdAt: string;
}

interface SubscriptionDashboardViewProps {
  currentPlan: string;
  paymentStatus: string;
  userEmail: string;
  transactions: TransactionItem[];
  startDateStr: string;
  expiryDate: string;
  remainingDays: number;
  plans: any[];
}

export default function SubscriptionDashboardView({
  currentPlan,
  paymentStatus,
  userEmail,
  transactions,
  startDateStr,
  expiryDate,
  remainingDays,
  plans,
}: SubscriptionDashboardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header section with page title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/25 border border-indigo-200 dark:border-indigo-850 rounded-full">
          <Sparkles className="h-3 w-3" />
          <span>{t("subscription")}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t("choosePlan")}
        </h1>
        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Unlock premium media upload sizes, custom badges, ad-free browsing, and higher daily question limits to make the most of your StackSphere experience.
        </p>
      </div>

      {/* Current Active Plan Status Bar */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("activePlanLabel")}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-neutral-850 dark:text-neutral-100">
                {currentPlan} Membership
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 rounded-full capitalize">
                {paymentStatus}
              </span>
            </div>
            {currentPlan !== "Free" && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5">
                <p>
                  Started on <strong className="font-semibold">{startDateStr}</strong> • Expires on <strong className="font-semibold">{expiryDate}</strong>
                </p>
                <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  {remainingDays} days remaining
                </p>
              </div>
            )}
          </div>
        </div>
        {currentPlan === "Free" ? (
          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-550">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Select one of the premium plans below to upgrade instantly.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4 shrink-0 animate-bounce" />
            <span>You have premium privileges enabled!</span>
          </div>
        )}
      </div>

      {/* Subscription Plan Grid Client Component */}
      <SubscriptionPlanGrid
        plans={plans}
        currentPlan={currentPlan}
        userEmail={userEmail}
      />

      {/* Bottom informational card */}
      <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-250/50 dark:border-amber-900/30 rounded-2xl p-5 md:p-6 flex gap-4 items-start max-w-4xl mx-auto">
        <AlertCircle className="h-5 w-5 text-amber-550 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-200">
            About Subscription & Limits Management
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Daily question limits are reset at midnight server time. Premium privileges (image/video file uploads) are verified dynamically before storage processing. Payment transaction details will be documented and invoiced in full compliance with developer guidelines.
          </p>
        </div>
      </div>

      {/* Transaction & Invoice History List (Day 52) */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-4">
          <Clock className="h-5 w-5 text-indigo-650" />
          {t("billingHistory")}
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-400 dark:text-neutral-500 font-semibold">
            No subscription transactions found for this account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-700 text-neutral-500 dark:text-neutral-450 font-bold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 dark:divide-neutral-700">
                {transactions.map((tx: any) => (
                  <tr key={tx._id.toString()} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                    <td className="py-3.5 font-medium text-neutral-600 dark:text-neutral-350">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 font-bold text-neutral-850 dark:text-neutral-200">{tx.planName} Plan</td>
                    <td className="py-3.5 font-mono text-neutral-650 dark:text-neutral-300">
                      {tx.currency} {tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 font-mono text-neutral-500">{tx.paymentId}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === "success" 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-250" 
                          : tx.status === "failed"
                          ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-250"
                          : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-250"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {tx.status === "success" ? (
                        <a
                          href={`/invoices/invoice_${tx.paymentId}.pdf`}
                          download={`invoice_${tx.paymentId}.pdf`}
                          className="inline-flex items-center gap-1.5 text-indigo-650 hover:text-indigo-550 font-bold transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{t("downloadInvoice")}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">—</span>
                      )}
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
