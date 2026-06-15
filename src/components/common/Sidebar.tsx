import React from "react";
import Link from "next/link";
import { Home, HelpCircle, MessageSquare, CreditCard, Settings, ShieldAlert } from "lucide-react";

export default function Sidebar() {
  // Navigation items representing our core features
  const menuItems = [
    { name: "Home Dashboard", href: "/dashboard", icon: Home },
    { name: "Q&A Forum", href: "/", icon: HelpCircle },
    { name: "Social Feed", href: "/social", icon: MessageSquare },
    { name: "Subscriptions", href: "/subscription", icon: CreditCard },
    { name: "Login History", href: "/login-history", icon: ShieldAlert },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hidden md:flex flex-col justify-between py-6">
      
      {/* Top Section: Navigation Links */}
      <div className="px-4 space-y-1">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-3">
          Menu Navigation
        </p>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 h-10 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors group"
              >
                <Icon className="h-4 w-4 text-neutral-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Footer Copyright Info */}
      <div className="px-6 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-center">
        <p className="text-xs text-neutral-400 dark:text-neutral-600">
          © 2026 StackSphere
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-600">
          ElevanceSkills Internship
        </p>
      </div>

    </aside>
  );
}
