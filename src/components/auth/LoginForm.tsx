"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const { language, t } = useTranslation();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDeleted = searchParams.get("message") === "deleted";
  const [infoMessage, setInfoMessage] = useState<string | null>(
    isDeleted ? "Your account has been permanently deleted." : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    // Basic client-side validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (showOtpInput && (!otpCode || otpCode.trim().length !== 6)) {
      setError("Please enter the 6-digit verification code sent to your email.");
      setIsLoading(false);
      return;
    }

    try {
      // Trigger NextAuth login logic
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        code: showOtpInput ? otpCode.trim() : undefined,
        language,
      });

      if (res?.error) {
        if (res.error === "OTP_REQUIRED") {
          setShowOtpInput(true);
          setInfoMessage(
            language === "fr"
              ? "Un code de vérification (OTP) a été envoyé à votre adresse e-mail. Veuillez le saisir ci-dessous."
              : "A 6-digit security code (OTP) has been sent to your registered email address. Please check your inbox."
          );
        } else {
          setError(res.error);
          if (showOtpInput) {
            setOtpCode(""); // Clear invalid code for fresh entry
          }
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setOtpCode("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        code: undefined, // Force fresh OTP dispatch
        language,
      });
      if (res?.error === "OTP_REQUIRED") {
        setInfoMessage("A fresh 6-digit OTP code has been sent to your email address.");
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError("Failed to resend OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
          {showOtpInput ? (
            <>
              <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Security Verification</span>
            </>
          ) : (
            <span>{t("signInTitle")}</span>
          )}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {showOtpInput
            ? "Enter the 6-digit verification code sent to your email."
            : t("signInSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg text-sm text-center font-medium">
            {infoMessage}
          </div>
        )}

        {!showOtpInput ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {t("emailAddress")}
              </label>
              <input
                required
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                >
                  {t("password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-450 hover:underline"
                >
                  {t("forgotPasswordLink")}
                </Link>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-center">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Signing in as</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white truncate">{email}</div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="otpCode"
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center"
              >
                {t("otpCode")}
              </label>
              <input
                required
                autoFocus
                type="text"
                id="otpCode"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-widest text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtpCode("");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Resend Code</span>
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span>{t("loading")}</span>
          ) : showOtpInput ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Verify OTP & Sign In</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>{t("signInButton")}</span>
            </>
          )}
        </button>

        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-2">
          <span>{t("noAccount")} </span>
          <Link
            href="/register"
            className="font-bold text-indigo-600 dark:text-indigo-450 hover:underline"
          >
            {t("signUpNow")}
          </Link>
        </div>
      </form>
    </div>
  );
}
