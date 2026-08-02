"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/providers/I18nProvider";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
  actorName: string;
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail on network/unauth
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // Fail silently
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title={t("notificationsTitle")}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-3.5 border-b border-neutral-150 dark:border-neutral-700 flex justify-between items-center">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              {t("notificationsTitle")} ({unreadCount})
            </h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-indigo-650 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAllReadBtn")}
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-700/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                {t("noNotifications")}
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  href={n.link || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-750 ${
                    !n.read ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-medium" : ""
                  }`}
                >
                  <p className="text-neutral-850 dark:text-neutral-200 leading-snug">{n.message}</p>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
