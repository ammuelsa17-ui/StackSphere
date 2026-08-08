"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, CreditCard, Award, MessageSquare, Layers } from "lucide-react";

interface CrossNavLink {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
}

interface ExploreCrossNavProps {
  currentPath: "/explore/questions" | "/explore/social" | "/pricing" | "/explore/rewards" | "/explore/features";
}

export default function ExploreCrossNav({ currentPath }: ExploreCrossNavProps) {
  const getNavLinks = (): CrossNavLink[] => {
    switch (currentPath) {
      case "/explore/questions":
        return [
          {
            title: "Explore Social Space",
            description: "See photo & video feed demos and developer network posting rules",
            href: "/explore/social",
            icon: <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: "View Membership Plans",
            description: "Compare daily question limits across Free, Bronze, Silver & Gold tiers",
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: "Create Free Account",
            description: "Sign up in 30 seconds to ask technical questions and collect reputation",
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            primary: true,
          },
        ];
      case "/explore/social":
        return [
          {
            title: "Explore Q&A Community",
            description: "Browse recent developer technical questions and solution threads",
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: "Learn About Rewards",
            description: "Discover how to earn +5 points per answer and transfer reputation",
            href: "/explore/rewards",
            icon: <Award className="h-5 w-5 text-amber-500" />,
          },
          {
            title: "Join StackSphere",
            description: "Create your developer profile to connect with peers and share updates",
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
            primary: true,
          },
        ];
      case "/explore/rewards":
        return [
          {
            title: "Explore Q&A Community",
            description: "Answer community questions to start collecting reputation points",
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: "View Membership Plans",
            description: "Unlock higher daily allowances with Bronze, Silver & Gold plans",
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: "Create Account",
            description: "Register to unlock your personal points wallet and peer transfer",
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
            primary: true,
          },
        ];
      case "/pricing":
        return [
          {
            title: "Explore Platform Features",
            description: "View full-stack capabilities including 6 languages, 2FA, & audit logs",
            href: "/explore/features",
            icon: <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: "Browse Q&A Forum",
            description: "Check public questions feed and community allowance limits",
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: "Sign In to Upgrade",
            description: "Already have an account? Sign in to upgrade your membership tier",
            href: "/login",
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            primary: true,
          },
        ];
      case "/explore/features":
      default:
        return [
          {
            title: "View Membership Plans",
            description: "Explore subscription pricing options and question daily limits",
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: "Explore Q&A Community",
            description: "Browse live technical questions and developer discussions",
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: "Create Free Account",
            description: "Join StackSphere to access all developer features and rewards",
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
            primary: true,
          },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-600" />
            Explore More of StackSphere
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Discover other areas of the platform or sign in to participate in the community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group ${
              link.primary
                ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white shadow-md hover:shadow-lg"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 border-neutral-200 dark:border-neutral-700 shadow-xs"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${link.primary ? "bg-white/10 text-white" : "bg-neutral-100 dark:bg-neutral-900"}`}>
                  {link.icon}
                </div>
                <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${link.primary ? "text-white/80" : "text-neutral-400"}`} />
              </div>
              <h4 className={`text-sm font-bold ${link.primary ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                {link.title}
              </h4>
              <p className={`text-xs leading-relaxed ${link.primary ? "text-indigo-100" : "text-neutral-500 dark:text-neutral-400"}`}>
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
