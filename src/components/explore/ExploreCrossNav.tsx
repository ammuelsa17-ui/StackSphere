"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, CreditCard, Award, MessageSquare, Layers } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

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
  const { t } = useTranslation();

  const getNavLinks = (): CrossNavLink[] => {
    switch (currentPath) {
      case "/explore/questions":
        return [
          {
            title: t("socialSpacePreview"),
            description: t("socialFeatureDesc"),
            href: "/explore/social",
            icon: <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: t("plansPricing"),
            description: t("subscriptionFeatureDesc"),
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: t("createAccount"),
            description: t("createAccountFooterDesc"),
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            primary: true,
          },
        ];
      case "/explore/social":
        return [
          {
            title: t("qaCommunity"),
            description: t("qaFeatureDesc"),
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: t("rewardsSystem"),
            description: t("rewardsFeatureDesc"),
            href: "/explore/rewards",
            icon: <Award className="h-5 w-5 text-amber-500" />,
          },
          {
            title: t("joinStackSphere"),
            description: t("createAccountFooterDesc"),
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
            primary: true,
          },
        ];
      case "/explore/rewards":
        return [
          {
            title: t("qaCommunity"),
            description: t("qaFeatureDesc"),
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: t("plansPricing"),
            description: t("subscriptionFeatureDesc"),
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: t("createAccount"),
            description: t("createAccountFooterDesc"),
            href: "/register",
            icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
            primary: true,
          },
        ];
      case "/pricing":
        return [
          {
            title: t("platformFeatures"),
            description: t("featuresSubtitle"),
            href: "/explore/features",
            icon: <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: t("qaCommunity"),
            description: t("qaFeatureDesc"),
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: t("signIn"),
            description: t("signInSubtitle"),
            href: "/login",
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            primary: true,
          },
        ];
      case "/explore/features":
      default:
        return [
          {
            title: t("plansPricing"),
            description: t("subscriptionFeatureDesc"),
            href: "/pricing",
            icon: <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          },
          {
            title: t("qaCommunity"),
            description: t("qaFeatureDesc"),
            href: "/explore/questions",
            icon: <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            title: t("createAccount"),
            description: t("createAccountFooterDesc"),
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
            {t("explorePlatform")}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t("featuresSubtitle")}
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
