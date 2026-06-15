import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        
        {/* Left: Copyright */}
        <div>
          <span>© 2026 StackSphere. All Rights Reserved.</span>
        </div>

        {/* Center: Guidelines Link */}
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Support
          </Link>
        </div>

        {/* Right: Project Info */}
        <div>
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            ElevanceSkills Internship Project
          </span>
        </div>

      </div>
    </footer>
  );
}
