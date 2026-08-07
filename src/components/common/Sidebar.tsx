"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HelpCircle, MessageSquare, CreditCard, Settings, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Navigation items representing core features
  const menuItems = [
    { name: t("dashboard"), href: "/dashboard", icon: Home },
    { name: t("qaForum"), href: "/", icon: HelpCircle },
    { name: t("socialSpace"), href: "/social", icon: MessageSquare },
    { name: t("subscription"), href: "/subscription", icon: CreditCard },
    { name: t("loginHistory"), href: "/login-history", icon: ShieldAlert },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (md breakpoint and above) */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm hidden md:flex flex-col justify-between py-6 z-40">
        {/* Navigation Links */}
        <div className="px-4 space-y-1">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-3">
            {t("menuNavigation")}
          </p>
          
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 h-10 text-sm rounded-lg transition-all group ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold border-r-2 border-indigo-600"
                      : "font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-neutral-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="px-6 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            © 2026 StackSphere
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600">
            ElevanceSkills Internship
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (below md breakpoint) */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around md:hidden z-50 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full text-[10px] transition-all ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="truncate max-w-[50px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
