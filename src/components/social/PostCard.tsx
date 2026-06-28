"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Star, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    mediaUrl?: string;
    mediaType?: "image" | "video" | "none";
    author: {
      name: string;
      email?: string;
      avatarUrl?: string;
      subscription?: {
        plan: string;
      };
    };
    likes: string[]; // List of user IDs who liked
    commentsCount: number;
    sharesCount: number;
    createdAt: string | Date;
  };
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId = "" }: PostCardProps) {
  // Local state for basic visual interactivity
  const [liked, setLiked] = useState(post.likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const handleLike = async () => {
    if (isTogglingLike) return;
    setIsTogglingLike(true);

    // Optimistically update states
    const wasLiked = liked;
    const initialCount = likesCount;

    setLiked(!wasLiked);
    setLikesCount(wasLiked ? initialCount - 1 : initialCount + 1);

    try {
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update like status");
      }

      const resData = await response.json();
      if (resData.success) {
        setLiked(resData.liked);
        setLikesCount(resData.likesCount);
      }
    } catch (err: any) {
      console.error("Like toggle error:", err);
      // Rollback on failure
      setLiked(wasLiked);
      setLikesCount(initialCount);
      alert(err.message || "An error occurred while updating the like count.");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleShare = () => {
    setSharesCount((prev) => prev + 1);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a premium gradient based on the author's name
  const getAvatarColor = (name: string) => {
    const charSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-blue-500 to-indigo-600",
      "from-violet-500 to-fuchsia-600",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-pink-600",
    ];
    return colors[charSum % colors.length];
  };

  // Resolve visual classes based on the user's plan
  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "gold":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30";
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-305 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-805/30";
      case "bronze":
        return "bg-orange-100 text-orange-850 border-orange-250 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-450 dark:border-neutral-800/30";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(post.author.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {getInitials(post.author.name)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 hover:text-indigo-600 transition-colors cursor-pointer">
                {post.author.name}
              </h4>
              {post.author.subscription?.plan && (
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold border rounded-full ${getPlanColor(post.author.subscription.plan)}`}>
                  <Star className="h-2 w-2 fill-current" />
                  {post.author.subscription.plan}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Options Button */}
        <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Post Text Content */}
      <div className="text-sm text-neutral-700 dark:text-neutral-350 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Optional Media Preview */}
      {post.mediaUrl && post.mediaType !== "none" && (
        <div className="relative rounded-xl overflow-hidden border border-neutral-150 dark:border-neutral-700/60 max-h-[350px] bg-neutral-50 dark:bg-neutral-900/20">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-full object-cover max-h-[350px]"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="Post attachment"
              className="w-full h-full object-cover max-h-[350px] hover:scale-[1.01] transition-transform duration-300"
            />
          )}
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700/60 pt-3.5 mt-2">
        {/* Like action button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
            liked
              ? "text-rose-650 bg-rose-50 dark:bg-rose-950/20"
              : "text-neutral-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform duration-200 active:scale-125 ${liked ? "fill-current text-rose-650" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* Comment action button */}
        <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 py-1.5 px-3 rounded-lg transition-all">
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentsCount}</span>
        </button>

        {/* Share action button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 py-1.5 px-3 rounded-lg transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>{sharesCount}</span>
        </button>
      </div>

    </div>
  );
}
