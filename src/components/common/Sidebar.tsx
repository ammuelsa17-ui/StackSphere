"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  HelpCircle,
  PlusCircle,
  FileText,
  MessageSquare,
  Users,
  Award,
  Send,
  CreditCard,
  User,
  ShieldAlert,
  Settings,
  Menu,
  X,
  LogOut,
  Globe,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAuthenticated = status === "authenticated" && session?.user;

  // Navigation for GUESTS / NEW USERS
  const guestGroups = [
    {
      title: "EXPLORE PLATFORM",
      items: [
        { name: "Home Overview", href: "/", icon: Home },
        { name: "Q&A Community", href: "/dashboard", icon: HelpCircle },
        { name: "Social Space Preview", href: "/social", icon: MessageSquare },
        { name: "Plans & Pricing", href: "/subscription", icon: CreditCard },
        { name: "Rewards System", href: "/profile", icon: Award },
      ],
    },
    {
      title: "GET STARTED",
      items: [
        { name: "Sign In", href: "/login", icon: LogIn },
        { name: "Create Account", href: "/register", icon: UserPlus },
      ],
    },
  ];

  // Grouped Navigation Structure for AUTHENTICATED USERS
  const menuGroups = [
    {
      title: "GENERAL",
      items: [{ name: t("dashboard"), href: "/dashboard", icon: Home }],
    },
    {
      title: "Q&A FORUM",
      items: [
        { name: t("qaForum"), href: "/", icon: HelpCircle },
        { name: "Ask Question", href: "/dashboard", icon: PlusCircle },
        { name: "My Questions", href: "/dashboard?filter=mine", icon: FileText },
      ],
    },
    {
      title: "SOCIAL SPACE",
      items: [
        { name: t("socialSpace"), href: "/social", icon: MessageSquare },
        { name: "Friends & Network", href: "/social?tab=friends", icon: Users },
      ],
    },
    {
      title: "REWARDS",
      items: [
        { name: "My Reputation Points", href: "/profile", icon: Award },
        { name: "Transfer Points", href: "/profile?action=transfer", icon: Send },
      ],
    },
    {
      title: "MEMBERSHIP",
      items: [{ name: t("subscription"), href: "/subscription", icon: CreditCard }],
    },
    {
      title: "ACCOUNT & SECURITY",
      items: [
        { name: "Profile", href: "/profile", icon: User },
        { name: t("loginHistory"), href: "/login-history", icon: ShieldAlert },
        { name: t("settings"), href: "/settings", icon: Settings },
      ],
    },
  ];

  const activeGroups = isAuthenticated ? menuGroups : guestGroups;

  const bottomBarItems = isAuthenticated
    ? [
        { name: "Home", href: "/", icon: Home },
        { name: "Q&A", href: "/dashboard", icon: HelpCircle },
        { name: "Social", href: "/social", icon: MessageSquare },
        { name: "Plans", href: "/subscription", icon: CreditCard },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Q&A", href: "/dashboard", icon: HelpCircle },
        { name: "Pricing", href: "/subscription", icon: CreditCard },
        { name: "Login", href: "/login", icon: LogIn },
      ];

  return (
    <>
      {/* Desktop Sidebar (md breakpoint and above) */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm hidden md:flex flex-col justify-between py-5 z-40 overflow-y-auto">
        {/* Grouped Navigation Links */}
        <div className="px-4 space-y-5">
          {activeGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-3 mb-1.5">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 h-9 text-xs rounded-lg transition-all group ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold border-r-2 border-indigo-600"
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
          ))}
        </div>

        {/* Footer Info */}
        <div className="px-6 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-center mt-4">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            © 2026 StackSphere
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600">
            Developer Ecosystem Platform
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around md:hidden z-50 px-2">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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

        {/* Menu Drawer Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <Menu className="h-4 w-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end bg-neutral-900/60 backdrop-blur-xs">
          <div className="w-4/5 max-w-xs bg-white dark:bg-neutral-950 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  Navigation Menu
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {activeGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 mb-1">
                      {group.title}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsDrawerOpen(false)}
                          className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg"
                        >
                          <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
