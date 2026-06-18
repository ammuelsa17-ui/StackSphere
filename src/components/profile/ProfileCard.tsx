import React from "react";
import { Award, Star, Calendar } from "lucide-react";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    points: number;
    subscription?: {
      plan: string;
    };
    createdAt: string | Date;
  };
}

export default function ProfileCard({ user }: ProfileCardProps) {
  // Extract user initials for the avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate color palette based on name characters
  const getAvatarColor = (name: string) => {
    const charSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-blue-550 to-indigo-600",
      "from-violet-500 to-fuchsia-600",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-pink-600",
    ];
    return colors[charSum % colors.length];
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
      
      {/* Dynamic Initials Avatar */}
      <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-3xl shadow-sm tracking-wider`}>
        {getInitials(user.name)}
      </div>

      {/* User Basic Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          {user.name}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {user.email}
        </p>
      </div>

      {/* Subscription Plan Badge */}
      <div className="w-full pt-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
        <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Membership Plan</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850 rounded-full">
          <Star className="h-3 w-3 fill-current" />
          {user.subscription?.plan || "Free"}
        </span>
      </div>

      {/* Points Badge */}
      <div className="w-full pb-4 border-b border-neutral-100 dark:border-neutral-700 flex justify-between items-center">
        <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Reward Points</span>
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-655 dark:text-amber-400 border border-amber-200 dark:border-amber-850 rounded-full">
          <Award className="h-3 w-3" />
          {user.points || 0} Points
        </span>
      </div>

      {/* Account Info: Member Since */}
      <div className="w-full flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        <Calendar className="h-4 w-4" />
        <span>
          Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
