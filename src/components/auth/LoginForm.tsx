"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";
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

    if (showOtpInput && !otpCode) {
      setError("Please enter the verification code.");
      setIsLoading(false);
      return;
    }

    try {
      // Trigger NextAuth login logic
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        code: showOtpInput ? otpCode : undefined,
        language,
      });

      if (res?.error) {
        if (res.error === "OTP_REQUIRED") {
          setShowOtpInput(true);
          if (language === "fr") {
            setInfoMessage("Un code de vérification (OTP) a été envoyé à votre adresse e-mail. Veuillez le saisir ci-dessous.");
          } else {
            setInfoMessage(`A verification code (OTP) has been sent via SMS to your mobile phone. Please enter it below.`);
          }
        } else {
          setError(res.error); // Display login error (e.g. wrong password)
        }
      } else {
        router.push("/dashboard"); // Redirect to dashboard on success
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100">
          {t("signInTitle")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {t("signInSubtitle")}
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {t("emailAddress")}
          </label>
          <input
            required
            disabled={showOtpInput}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 disabled:opacity-60"
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
              disabled={showOtpInput}
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={showOtpInput}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showOtpInput && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="otpCode"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              {t("otpCode")}
            </label>
            <input
              required
              type="text"
              id="otpCode"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-sm text-center tracking-widest font-mono text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span>{t("loading")}</span>
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
