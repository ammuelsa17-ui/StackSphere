"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Save, Edit2, X } from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";

interface EditProfileFormProps {
  initialUser: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

export default function EditProfileForm({ initialUser }: EditProfileFormProps) {
  const [name, setName] = useState(initialUser.name);
  const [phoneNumber, setPhoneNumber] = useState(initialUser.phoneNumber || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = () => {
    // Revert form values back to original state and close edit mode
    setName(initialUser.name);
    setPhoneNumber(initialUser.phoneNumber || "");
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!name || name.trim() === "") {
      setError("Full Name is required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred during updating.");
      } else {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        router.refresh(); // Tells Next.js to reload data from Server Components
      }
    } catch (err: any) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-905 dark:text-white flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Personal Account Details
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-250 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg transition-all"
          >
            <Edit2 className="h-3 w-3" />
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Alerts */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-650 dark:text-red-400 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-250 dark:border-emerald-800/40 text-emerald-650 dark:text-emerald-400 p-3 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        {/* Full Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
              <User className="h-4 w-4" />
            </div>
            <input
              required
              disabled={!isEditing || isLoading}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-neutral-705 bg-neutral-50 dark:bg-neutral-900/50 disabled:opacity-75 disabled:bg-neutral-100/50 dark:disabled:bg-neutral-900/20 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Email Address (Always Disabled/Read-Only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-450 dark:text-neutral-500">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              disabled
              type="email"
              value={initialUser.email}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-neutral-705 bg-neutral-100/60 dark:bg-neutral-900/30 text-sm text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
            />
          </div>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-550 leading-none px-1">
            Email address cannot be changed for account security and verification purposes.
          </span>
        </div>

        {/* Phone Number Field */}
        <PhoneInput
          disabled={!isEditing || isLoading}
          value={phoneNumber}
          onChange={(normalized) => setPhoneNumber(normalized)}
          label="PHONE NUMBER"
          helperText="We'll use this number for account verification and security."
        />

        {/* Editing Actions */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 h-10 text-sm font-semibold border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 rounded-xl transition-all disabled:opacity-50 text-neutral-700 dark:text-neutral-300"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 h-10 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
