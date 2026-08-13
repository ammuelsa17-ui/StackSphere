"use client";

import React from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function ProfileHeader() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        {t("userProfile")}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {t("forgotPasswordSubtitle")}
      </p>
    </div>
  );
}
