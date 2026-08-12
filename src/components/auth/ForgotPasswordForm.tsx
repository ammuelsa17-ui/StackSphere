"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, ArrowLeft, CheckCircle2, Shield, Lock, Eye, EyeOff, Sparkles, Copy, Check } from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";
import { useTranslation } from "@/components/providers/I18nProvider";

type RecoveryStep = "REQUEST" | "VERIFY" | "RESET" | "SUCCESS";
type RecoveryMethod = "email" | "phone";

export default function ForgotPasswordForm() {
  const { language, t } = useTranslation();
  const [step, setStep] = useState<RecoveryStep>("REQUEST");
  const [method, setMethod] = useState<RecoveryMethod>("phone");

  useEffect(() => {
    if (language === "fr") {
      setMethod("email");
    } else {
      setMethod("phone");
    }
  }, [language]);

  // Form input states
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Password Generator states
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Client-side password generator with only uppercase and lowercase letters using crypto-safe randomness
  const handleGeneratePassword = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const array = new Uint32Array(12);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 12; i++) {
        array[i] = Math.floor(Math.random() * letters.length);
      }
    }
    let randomPassword = "";
    for (let i = 0; i < 12; i++) {
      randomPassword += letters.charAt(array[i] % letters.length);
    }
    setPassword(randomPassword);
    setConfirmPassword(randomPassword);
    setGeneratedPassword(randomPassword);
    setCopied(false);
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (method === "email") {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!email || !emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }
    } else {
      if (!phoneNumber || phoneNumber.trim().length < 8) {
        setError("Please enter a valid phone number.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const body = method === "email" 
        ? { email: email.trim().toLowerCase() }
        : { phoneNumber: phoneNumber.trim() };

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to request verification code.");
        setIsLoading(false);
        return;
      }

      setResendTimer(60);
      setStep("VERIFY");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const identity = method === "email" ? email.trim().toLowerCase() : phoneNumber.trim();

      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, code: verificationCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      setResetToken(data.resetToken || "");
      handleGeneratePassword();
      setStep("RESET");
    } catch (err: any) {
      setError(err.message || "An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isLettersOnly = /^[a-zA-Z]+$/.test(password);
    if (!password || password.length < 8 || !isLettersOnly) {
      setError("Password must be at least 8 characters long and contain only letters.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "REQUEST") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <span>{t("forgotPasswordTitle")}</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            {t("forgotPasswordSubtitle")}
          </p>
        </div>

        {/* Dual Selectable Recovery Method Tabs */}
        <div className="grid grid-cols-2 gap-1.5 border border-neutral-200 dark:border-neutral-700 mb-6 p-1 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
          <button
            type="button"
            onClick={() => { setMethod("email"); setError(null); }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              method === "email"
                ? "bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-neutral-200/60 dark:border-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{t("emailRecoveryTab")}</span>
          </button>
          <button
            type="button"
            onClick={() => { setMethod("phone"); setError(null); }}
            className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              method === "phone"
                ? "bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-neutral-200/60 dark:border-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{t("phoneRecoveryTab")}</span>
          </button>
        </div>

        <form onSubmit={handleRequestCode} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          {method === "email" ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {t("emailAddress")}
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-sans text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
          ) : (
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              disabled={isLoading}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? t("loading") : t("sendResetLink")}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("backToLogin")}</span>
            </Link>
          </div>
        </form>
      </div>
    );
  }

  if (step === "VERIFY") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span>{t("verificationCode")}</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            {t("enterOtpCode")}
          </p>
          <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md inline-block">
            {method === "email" ? email : phoneNumber}
          </div>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center">
              {t("otpCode")}
            </label>
            <input
              required
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              className="w-full text-center h-12 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xl font-mono font-bold tracking-widest text-neutral-850 dark:text-neutral-100 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? t("loading") : t("verifyOtpButton")}
          </button>

          <div className="flex justify-between items-center text-xs pt-2">
            <button
              type="button"
              onClick={() => { setStep("REQUEST"); setError(null); }}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-semibold"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={resendTimer > 0}
              onClick={handleRequestCode}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:text-neutral-400 cursor-pointer"
            >
              {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === "RESET") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <span>{t("forgotPasswordTitle")}</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Generate or enter your new letters-only password below.
          </p>
        </div>

        {/* Generated Password Box */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Generated Temporary Password
            </span>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Regenerate
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800 rounded-lg">
            <span className="font-mono text-sm font-bold tracking-widest text-purple-900 dark:text-purple-200 select-all">
              {generatedPassword || "GENERATING..."}
            </span>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="p-1.5 bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-md transition-colors cursor-pointer"
              title="Copy Password"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-[10px] text-purple-600 dark:text-purple-400 leading-tight">
            {t("newPasswordHint")} (Letters ONLY: A-Z, a-z)
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t("newPasswordLabel")}
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-sans text-neutral-850 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t("confirmPassword")}
            </label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm font-sans text-neutral-850 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? t("loading") : t("resetPasswordBtn")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h2 className="font-bold text-xl text-neutral-900 dark:text-white">
        Password Reset Successful
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        Your password has been successfully updated. You can now sign in with your new letters-only password!
      </p>
      <div className="pt-2">
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          {t("signInNow")}
        </Link>
      </div>
    </div>
  );
}
