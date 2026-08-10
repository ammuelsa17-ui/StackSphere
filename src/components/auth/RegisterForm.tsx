"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Eye, EyeOff, Sparkles, Copy, Check, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";
import PhoneInput from "@/components/common/PhoneInput";
import {
  checkPasswordRequirements,
  calculatePasswordStrength,
  generateCryptographicPassword,
} from "@/utils/validation";

export default function RegisterForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedBanner, setGeneratedBanner] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [duplicateField, setDuplicateField] = useState<"email" | "phone" | "both" | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const reqs = checkPasswordRequirements(password);
  const strength = calculatePasswordStrength(password);

  const handleSuggestPassword = () => {
    const gen = generateCryptographicPassword(18);
    setPassword(gen);
    setConfirmPassword(gen);
    setGeneratedBanner(true);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setError(null);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDuplicateField(null);
    setSuccess(null);

    // 1. Basic Client validations
    if (!name || !email || !phoneNumber || !password) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (!reqs.isValid) {
      setError(reqs.firstMissingError || "Password does not meet security requirements.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Make API Request
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicateField) {
          setDuplicateField(data.duplicateField);
        }
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100">
          {t("signUpTitle")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {t("signUpSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* Name Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {t("fullName")} *
          </label>
          <input
            required
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {t("emailAddress")} *
          </label>
          <input
            required
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`bg-neutral-50 dark:bg-neutral-900 border rounded-xl p-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
              duplicateField === "email" || duplicateField === "both"
                ? "border-rose-500 ring-1 ring-rose-500/30"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          />
          {(duplicateField === "email" || duplicateField === "both") && (
            <span className="text-xs text-rose-500 font-medium">This email address is already registered.</span>
          )}
        </div>

        {/* International Phone Input */}
        <PhoneInput
          required={true}
          value={phoneNumber}
          onChange={(normalized) => setPhoneNumber(normalized)}
          label={t("phoneNumber")}
          error={
            duplicateField === "phone" || duplicateField === "both"
              ? "This phone number is already registered."
              : null
          }
          helperText="We'll use this number for account verification and security."
        />

        {/* Password Input Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              {t("password")} *
            </label>
            <button
              type="button"
              onClick={handleSuggestPassword}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Suggest Strong Password</span>
            </button>
          </div>

          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setGeneratedBanner(false);
              }}
              placeholder="••••••••••••"
              className={`w-full bg-neutral-50 dark:bg-neutral-900 border rounded-xl py-3 pl-3 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                password && !reqs.isValid ? "border-amber-400 dark:border-amber-600" : "border-neutral-300 dark:border-neutral-700"
              }`}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Generated Password Banner */}
        {generatedBanner && password && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Strong password generated. Save it somewhere secure.</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Real-Time Password Strength Meter */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-neutral-500 dark:text-neutral-400">Password Strength:</span>
              <span
                className={`${
                  strength.label === "Weak"
                    ? "text-rose-500"
                    : strength.label === "Fair"
                    ? "text-amber-500"
                    : strength.label === "Strong"
                    ? "text-emerald-500"
                    : "text-indigo-500 font-bold"
                }`}
              >
                {strength.label}
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.colorClass}`}
                style={{ width: `${strength.widthPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Password Requirements Checklist */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1.5">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block">
            Your password must contain:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-medium">
            <div className={`flex items-center gap-1.5 ${reqs.hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500"}`}>
              {reqs.hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />}
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500"}`}>
              {reqs.hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />}
              <span>Uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500"}`}>
              {reqs.hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />}
              <span>Lowercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500"}`}>
              {reqs.hasNumber ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />}
              <span>Number</span>
            </div>
            <div className={`flex items-center gap-1.5 ${reqs.hasSpecial ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-400 dark:text-neutral-500"}`}>
              {reqs.hasSpecial ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-700" />}
              <span>Special character</span>
            </div>
          </div>
        </div>

        {/* Confirm Password Input Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {t("confirmPassword")} *
          </label>
          <div className="relative">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full bg-neutral-50 dark:bg-neutral-900 border rounded-xl py-3 pl-3 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                confirmPassword && confirmPassword !== password
                  ? "border-rose-500 ring-1 ring-rose-500/30"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            />
            <button
              type="button"
              aria-label="Toggle confirm password visibility"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <span className="text-xs text-rose-500 font-medium">Passwords do not match.</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>{isLoading ? t("loading") : t("signUpButton")}</span>
        </button>

        {/* Login redirect link */}
        <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>{t("alreadyHaveAccount")} </span>
          <Link
            href="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("signInLink")}
          </Link>
        </div>
      </form>
    </div>
  );
}
