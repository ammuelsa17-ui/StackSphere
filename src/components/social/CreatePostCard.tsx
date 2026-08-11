"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Image, Video, Send, X, Star, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";

interface CreatePostCardProps {
  currentUser?: {
    id: string;
    name: string;
    email?: string;
    image?: string;
    plan?: string;
    friendCount?: number;
    postsCountToday?: number;
    dailyLimit?: number;
    remainingPosts?: number;
  };
  onPostCreated?: (post: {
    content: string;
    mediaUrl?: string;
    mediaType: "image" | "video" | "none";
  }) => void;
}

export default function CreatePostCard({ currentUser, onPostCreated }: CreatePostCardProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!session || !session.user) {
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mx-auto">
          👥
        </div>
        <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
          {t("socialSpacePreview")}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {t("socialFeatureDesc")}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="/register"
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
          >
            {t("createAccount")}
          </a>
          <a
            href="/login"
            className="px-4 py-2 text-xs font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            {t("signIn")}
          </a>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const charSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-purple-500 to-pink-600",
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
    ];
    return colors[charSum % colors.length];
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus(t("loading"));

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || t("error"));
        return;
      }

      setMediaUrl(data.url);
      setMediaType("image");
      setUploadStatus(null);
    } catch (err: any) {
      alert(err.message || t("error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus(t("loading"));

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || t("error"));
        return;
      }

      setMediaUrl(data.url);
      setMediaType("video");
      setUploadStatus(null);
    } catch (err: any) {
      alert(err.message || t("error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType("none");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrl: mediaUrl || "",
          mediaType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || t("error"));
        return;
      }

      setContent("");
      setMediaUrl(null);
      setMediaType("none");
      setIsExpanded(false);

      if (onPostCreated) {
        onPostCreated(data.post);
      }
    } catch (err: any) {
      alert(err.message || t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostBlocked = (currentUser?.friendCount === 0) || 
                        (currentUser?.dailyLimit !== Infinity && currentUser?.remainingPosts === 0);
  
  const blockReason = currentUser?.friendCount === 0 
    ? t("postingBlockedError")
    : t("dailyPostLimitReached");

  const userName = session?.user?.name || "Developer";

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm transition-all duration-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Area */}
        <div className="flex gap-3 sm:gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={userName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(userName)} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm shrink-0`}>
              {getInitials(userName)}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <textarea
              disabled={isPostBlocked}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleTextareaFocus}
              placeholder={isPostBlocked ? t("postingBlockedError") : t("postPlaceholder")}
              rows={isExpanded ? 3 : 1}
              className="w-full bg-transparent text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none text-sm py-2 leading-relaxed disabled:opacity-60"
            />

            {/* Social Posting Limit Tracker */}
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold flex items-center justify-between mt-1 pt-1 border-t border-neutral-100 dark:border-neutral-750/30">
              <span>{t("friendsNetwork")}: <strong>{currentUser?.friendCount ?? 0}</strong></span>
              <span>
                {currentUser?.dailyLimit === Infinity ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("socialTierOverTenDesc")}</span>
                ) : (
                  <span>
                    Posts Today: <strong>{currentUser?.postsCountToday ?? 0} / {currentUser?.dailyLimit ?? 0}</strong> 
                    { (currentUser?.remainingPosts ?? 0) === 0 ? (
                      <span className="text-rose-500 font-bold ml-1.5">{t("limitReached")}</span>
                    ) : (
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold ml-1.5">({currentUser?.remainingPosts ?? 0} remaining)</span>
                    )}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {isPostBlocked && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900 text-rose-600 dark:text-rose-450 p-3.5 rounded-xl flex gap-3 text-xs leading-normal ml-11 sm:ml-14 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">{t("error")}</span>
              {blockReason}
            </div>
          </div>
        )}

        {/* Media Preview Box */}
        {mediaUrl && (
          <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 ml-11 sm:ml-14 max-h-60">
            {mediaType === "image" ? (
              <img src={mediaUrl} alt="Upload preview" className="w-full h-full object-cover max-h-60" />
            ) : (
              <video src={mediaUrl} controls className="w-full h-full object-cover max-h-60" />
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Action Controls */}
        {isExpanded && (
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-750 ml-11 sm:ml-14 animate-fadeIn">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading || isPostBlocked}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Image className="h-3.5 w-3.5 text-indigo-500" />
                <span>Photo</span>
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading || isPostBlocked}
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Video className="h-3.5 w-3.5 text-pink-500" />
                <span>Video</span>
              </button>

              {uploadStatus && (
                <span className="text-[10px] font-semibold text-neutral-400 animate-pulse">
                  {uploadStatus}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading || isPostBlocked || (!content.trim() && !mediaUrl)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t("postButton")}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
