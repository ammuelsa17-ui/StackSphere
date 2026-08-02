"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Globe, LogIn, UserPlus, LogOut, LayoutDashboard, User } from "lucide-react";
import { useTranslation, Language } from "@/components/providers/I18nProvider";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const { language, setLanguage, t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white hidden sm:block">
              Stack<span className="text-indigo-600">Sphere</span>
            </span>
          </Link>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search questions, posts, users..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Right Section: Navigation & Authentication */}
        <div className="flex items-center gap-4">
          {/* Explore Hub link */}
          <Link
            href="/social"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{t("socialSpace")}</span>
          </Link>

          {/* Language Switcher Dropdown */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-250/20 dark:border-neutral-800">
            <Globe className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer border-none pr-1"
            >
              <option value="en" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">EN</option>
              <option value="es" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">ES</option>
              <option value="hi" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">HI</option>
              <option value="pt" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">PT</option>
              <option value="zh" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">ZH</option>
              <option value="fr" className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">FR</option>
            </select>
          </div>

          {/* Vertical divider */}
          <span className="w-px h-5 bg-neutral-200 dark:bg-neutral-800" />

          {/* Authentication Links */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-20 h-9 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
            ) : session ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-all"
                >
                  <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                  <span className="hidden md:inline">{t("dashboard")}</span>
                </Link>
                
                <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium">
                  <User className="h-4 w-4 text-neutral-500" />
                  <span className="text-neutral-800 dark:text-neutral-200 max-w-[100px] truncate hidden sm:inline">
                    {session.user?.name}
                  </span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span className="hidden sm:inline text-red-600">{t("logout")}</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t("login")}</span>
                </Link>
                
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t("register")}</span>
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
