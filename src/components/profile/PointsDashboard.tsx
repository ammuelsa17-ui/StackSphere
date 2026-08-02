"use client";

import React, { useState, useEffect } from "react";
import { Award, ArrowUpRight, ArrowDownRight, RefreshCw, Trophy, Zap, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

interface RewardItem {
  _id: string;
  points: number;
  action: string;
  details: string;
  createdAt: string;
}

interface PointsDashboardProps {
  initialPoints: number;
}

export default function PointsDashboard({ initialPoints }: PointsDashboardProps) {
  const { t } = useTranslation();
  const [points, setPoints] = useState(initialPoints);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewardHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/rewards");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reward history.");
      }
      setRewards(data.rewards || []);
      
      // Calculate active points dynamically
      const totalPoints = data.rewards?.reduce((acc: number, curr: RewardItem) => acc + curr.points, 0) || 0;
      setPoints(Math.max(0, totalPoints));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardHistory();
  }, []);

  // Determine user badge based on points
  const getBadgeName = (pts: number) => {
    if (pts < 50) return "Starter Scholar";
    if (pts < 150) return "Active Contributor";
    if (pts < 500) return "Community Expert";
    return "Grandmaster Developer";
  };

  const getBadgeColor = (pts: number) => {
    if (pts < 50) return "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500";
    if (pts < 150) return "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-850 text-indigo-650 dark:text-indigo-400";
    if (pts < 500) return "bg-amber-50 dark:bg-amber-900/30 border-amber-250 dark:border-amber-850 text-amber-655 dark:text-amber-400";
    return "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-850 text-rose-600 dark:text-rose-400";
  };

  // Level Progression helper
  const getProgressPercentage = (pts: number) => {
    if (pts < 50) return (pts / 50) * 100;
    if (pts < 150) return ((pts - 50) / 100) * 100;
    if (pts < 500) return ((pts - 150) / 350) * 100;
    return 100;
  };

  const getNextThreshold = (pts: number) => {
    if (pts < 50) return 50;
    if (pts < 150) return 150;
    if (pts < 500) return 500;
    return null;
  };

  const getActionName = (action: string) => {
    switch (action) {
      case "answer_created":
        return "Contributed Answer";
      case "answer_upvoted":
        return "Answer Upvoted Bonus";
      case "answer_downvoted":
        return "Answer Downvote Deduction";
      case "answer_removed":
        return "Answer Removal Deduction";
      case "point_transfer_sent":
        return "Transferred Points Sent";
      case "point_transfer_received":
        return "Transferred Points Received";
      default:
        return "Reward Adjustment";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-4">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {t("pointsDashboard")}
        </h3>
        <button
          onClick={fetchRewardHistory}
          disabled={isLoading}
          className="text-neutral-450 hover:text-neutral-800 dark:hover:text-white p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Grid: Points Total & level progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Points */}
        <div className="md:col-span-1 border border-neutral-200 dark:border-neutral-750 rounded-xl p-5 flex flex-col justify-between bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {t("totalPoints")}
            </span>
            <h4 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {points} pts
            </h4>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold border rounded-full mt-4 self-start ${getBadgeColor(points)}`}>
            <Award className="h-3.5 w-3.5" />
            {getBadgeName(points)}
          </span>
        </div>

        {/* Level Progression Progress bar */}
        <div className="md:col-span-2 border border-neutral-200 dark:border-neutral-750 rounded-xl p-5 flex flex-col justify-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <span>Progress to Next Rank</span>
            {getNextThreshold(points) ? (
              <span>{points} / {getNextThreshold(points)} pts</span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1 font-bold">
                <Zap className="h-3 w-3 fill-current" />
                MAX RANK REACHED
              </span>
            )}
          </div>
          
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${getProgressPercentage(points)}%` }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
            />
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {(() => {
              const nextThreshold = getNextThreshold(points);
              return nextThreshold !== null
                ? `Earn ${nextThreshold - points} more points to reach the next rank tier.`
                : "You are contributing at the grandmaster level! Thank you for supporting the community.";
            })()}
          </p>
        </div>

      </div>

      {/* Rewards History Log */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-bold text-neutral-805 dark:text-neutral-200 uppercase tracking-wider">
          Recent Point Transactions
        </h4>

        {isLoading ? (
          <div className="text-center py-6 text-xs text-neutral-450">
            Loading transaction history...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-450 dark:text-neutral-500">
            No recent points earned or deducted. Contribute answers to earn rewards!
          </div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-750 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-750 overflow-hidden bg-neutral-50/20 dark:bg-neutral-900/5">
            {rewards.map((reward) => {
              const isPositive = reward.points >= 0;
              return (
                <div key={reward._id} className="p-3.5 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {getActionName(reward.action)}
                    </span>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      {reward.details || "System points allocation."}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`inline-flex items-center gap-0.5 font-extrabold font-mono text-sm ${
                      isPositive ? "text-emerald-650 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {isPositive ? (
                        <>
                          <ArrowUpRight className="h-4.5 w-4.5" />
                          +{reward.points}
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4.5 w-4.5" />
                          {reward.points}
                        </>
                      )}
                    </span>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-600 block">
                      {new Date(reward.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
