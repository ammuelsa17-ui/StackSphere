"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2, AlertTriangle, Lock, X, ShieldAlert, Loader2 } from "lucide-react";

import { useTranslation } from "@/components/providers/I18nProvider";

export default function DeleteAccountSection() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setPassword("");
    setConfirmation("");
    setError(null);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation.trim() !== "DELETE" || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmation: confirmation.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account deletion failed.");
      }

      // Success: Sign user out and redirect to login page with notification message
      await signOut({ callbackUrl: "/login?message=deleted" });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const isFormValid = password.length > 0 && confirmation.trim() === "DELETE";

  return (
    <>
      {/* Danger Zone Card */}
      <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-lg">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3>{t("dangerZoneTitle")}: {t("deleteAccountTitle")}</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              {t("deleteAccountDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t("deleteAccountBtn")}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isLoading}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/80 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Permanently Delete Account
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Self-service account deletion confirmation
                </p>
              </div>
            </div>

            {/* Warning Message Box */}
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
              <strong>Warning:</strong> Deleting your account is permanent. You will lose access to your profile, rewards, friends, subscription information and account data. This action cannot be undone.
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              
              {/* 1. Password Verification */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Current Password *</span>
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* 2. Type DELETE Confirmation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Type <span className="text-rose-600 dark:text-rose-400 font-mono">DELETE</span> to Confirm *
                </label>
                <input
                  required
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Permanently Delete Account</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
