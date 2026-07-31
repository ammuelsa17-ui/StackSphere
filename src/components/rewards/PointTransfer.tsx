"use client";

import React, { useState, useEffect } from "react";
import { Search, Send, CheckCircle, AlertCircle, AlertTriangle, UserCheck, RefreshCw } from "lucide-react";

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  points: number;
}

interface PointTransferProps {
  currentBalance: number;
  onTransferSuccess?: (newBalance: number) => void;
}

export default function PointTransfer({ currentBalance, onTransferSuccess }: PointTransferProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog confirmation modal toggle state
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Response feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search error");
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleTransfer = async () => {
    if (!selectedUser || amount <= 0) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);

    try {
      const res = await fetch("/api/users/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: selectedUser.email,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transfer points.");
      }

      setSuccess(data.message || "Transfer completed successfully!");
      setAmount(0);
      setSelectedUser(null);
      setQuery("");
      setUsers([]);
      
      if (onTransferSuccess && typeof data.newPoints === "number") {
        onTransferSuccess(data.newPoints);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Title */}
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-700 pb-4">
        <Send className="h-5 w-5 text-indigo-650" />
        Transfer Reward Points
      </h3>

      {/* Constraints Indicator alert banner */}
      {currentBalance <= 10 ? (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex gap-3 text-xs leading-normal">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Transfer Restrictions Active</span>
            Points transfer requires a minimum balance of **more than 10 points**. Your current balance is <strong>{currentBalance} pts</strong>.
          </div>
        </div>
      ) : null}

      {/* Success/Error Alert banner */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-650 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Recipient User Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Search Recipient (Name / Email)
          </label>
          
          <div className="relative">
            <input
              disabled={currentBalance <= 10 || isLoading}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email address..."
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
            />
            <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-450">
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </div>
          </div>

          {/* Search Dropdown Results */}
          {users.length > 0 && (
            <div className="border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-750 overflow-hidden shadow-md max-h-56 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setQuery("");
                    setUsers([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-neutral-850 dark:text-neutral-100 block">{user.name}</span>
                    <span className="text-neutral-400 text-[10px]">{user.email}</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-450 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                    {user.points} pts
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Target user Indicator display tag */}
        {selectedUser && (
          <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 p-3 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-650 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">{selectedUser.name}</span>
                <span className="text-[10px] text-neutral-450 dark:text-neutral-500">{selectedUser.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:underline px-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Transfer amount Input details */}
        {selectedUser && (
          <div className="flex flex-col gap-1.5 animate-fadeIn">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Amount to Transfer (pts)
            </label>
            <input
              required
              type="number"
              min={1}
              max={currentBalance}
              value={amount || ""}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
              placeholder="Enter point amount..."
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
            />
            {amount > currentBalance && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1">Amount exceeds your available balance!</span>
            )}
          </div>
        )}

        {/* Transfer Submit trigger button */}
        {selectedUser && amount > 0 && amount <= currentBalance && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full h-11 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Send className="h-4 w-4" />
            <span>Initiate Transfer</span>
          </button>
        )}
      </div>

      {/* Confirmation modal overlay screen */}
      {showConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Confirm Point Transfer</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to transfer <strong>{amount} points</strong> to <strong>{selectedUser.name}</strong> ({selectedUser.email})? This action is irreversible.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-3.5 py-1.5 border border-neutral-250 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-350 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {isLoading ? "Transferring..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
