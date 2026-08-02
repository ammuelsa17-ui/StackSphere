"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, ArrowLeft, CheckCircle2, Shield, Lock, Eye, EyeOff, Sparkles, Copy, Check } from "lucide-react";

type RecoveryStep = "REQUEST" | "VERIFY" | "RESET" | "SUCCESS";
type RecoveryMethod = "email" | "phone";

import { useTranslation } from "@/components/providers/I18nProvider";

export default function ForgotPasswordForm() {
  const { language, t } = useTranslation();
  const [step, setStep] = useState<RecoveryStep>("REQUEST");
  const [method, setMethod] = useState<RecoveryMethod>("email");

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

  // Client-side password generator with only uppercase and lowercase letters (Day 51)
  const handleGeneratePassword = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let randomPassword = "";
    // Generate 12 random letters
    for (let i = 0; i < 12; i++) {
      const index = Math.floor(Math.random() * letters.length);
      randomPassword += letters.charAt(index);
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

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to request verification code.");
      }

      if (resData.success) {
        // Expose code in development console for easy E2E automation/testing
        if (resData.verificationCode) {
          console.log(`[Dev Simulation] Verification code is: ${resData.verificationCode}`);
          setVerificationCode(resData.verificationCode); // Auto-fill in dev testing mode
        }
        setStep("VERIFY");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setIsLoading(true);
    setResendTimer(60);
    try {
      const body = method === "email" 
        ? { email: email.trim().toLowerCase() }
        : { phoneNumber: phoneNumber.trim() };

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to resend verification code.");
      }

      if (resData.success) {
        if (resData.verificationCode) {
          setVerificationCode(resData.verificationCode);
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to resend code.";
      setError(errMsg);
      setResendTimer(0);
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
      setError("Please enter a 6-digit verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const identity = method === "email" ? email : phoneNumber;
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, code: verificationCode.trim() }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Code verification failed.");
      }

      if (resData.success && resData.resetToken) {
        setResetToken(resData.resetToken);
        setStep("RESET");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Verification failed.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z]+$/.test(password)) {
      setError("Password must contain only letters (no numbers or special characters).");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to reset password.");
      }

      if (resData.success) {
        setStep("SUCCESS");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Password reset failed.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP: REQUEST CODE
  // ----------------------------------------------------
  if (step === "REQUEST") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <span>Recover Password</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Choose your recovery method below to receive a verification code
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-150 dark:border-neutral-700 mb-6 p-0.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
          {language === "fr" ? (
            <div className="w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 bg-white dark:bg-neutral-800 text-neutral-850 dark:text-white shadow-sm">
              <Mail className="h-3.5 w-3.5 text-indigo-600" />
              <span>Récupération par e-mail</span>
            </div>
          ) : (
            <div className="w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 bg-white dark:bg-neutral-800 text-neutral-850 dark:text-white shadow-sm">
              <Phone className="h-3.5 w-3.5 text-indigo-600" />
              <span>Mobile Phone Recovery</span>
            </div>
          )}
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
                Email Address
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  <Phone className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <span>Send Verification Code</span>
            )}
          </button>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/60 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP: VERIFY CODE
  // ----------------------------------------------------
  if (step === "VERIFY") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span>Verify Code</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Enter the 6-digit verification code sent to your {method === "email" ? "email" : "phone number"}
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="otp"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center"
            >
              6-Digit Code
            </label>
            <input
              required
              type="text"
              id="otp"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 text-center text-lg font-bold tracking-widest text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/60 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => { setStep("REQUEST"); setError(null); }}
              className="font-semibold text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Change details</span>
            </button>

            <button
              type="button"
              disabled={resendTimer > 0 || isLoading}
              onClick={handleResendOTP}
              className="font-semibold text-indigo-650 hover:text-indigo-550 transition-colors disabled:opacity-50 disabled:text-neutral-400"
            >
              {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP: RESET PASSWORD
  // ----------------------------------------------------
  if (step === "RESET") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            <span>New Password</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            Enter and confirm your new secure account password
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Random Password Generator Trigger Badge */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 py-1 px-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Sparkles className="h-3 w-3" />
              <span>Generate Letters-Only Password</span>
            </button>
          </div>

          {/* Show Generated Password if active */}
          {generatedPassword && (
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 flex justify-between items-center text-xs animate-fadeIn">
              <div className="min-w-0">
                <span className="text-neutral-400 block mb-0.5 text-[10px] font-semibold uppercase tracking-wider">Generated password (Letters only)</span>
                <span className="font-mono text-neutral-850 dark:text-neutral-100 select-all font-semibold tracking-wide break-all text-sm">{generatedPassword}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="text-neutral-450 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                title="Copy password"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              New Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (generatedPassword && e.target.value !== generatedPassword) {
                    setGeneratedPassword("");
                  }
                }}
                placeholder="••••••"
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
              <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-450">
                <Lock className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (generatedPassword && e.target.value !== generatedPassword) {
                    setGeneratedPassword("");
                  }
                }}
                placeholder="••••••"
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-10 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
              <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-neutral-450">
                <Lock className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP: SUCCESS PANEL
  // ----------------------------------------------------
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-center animate-fadeIn">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="font-sans font-bold text-2xl text-neutral-850 dark:text-neutral-100">
          Password Updated
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
          Your account password has been successfully updated. You can now log in using your new credentials.
        </p>
      </div>

      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-550 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors py-1.5 px-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
