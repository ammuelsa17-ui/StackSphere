import React from "react";
import Link from "next/link";
import { Search, Globe, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
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
            <span className="hidden sm:inline">Social Hub</span>
          </Link>

          {/* Vertical divider */}
          <span className="w-px h-5 bg-neutral-200 dark:bg-neutral-800" />

          {/* Authentication Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-3 h-9 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
