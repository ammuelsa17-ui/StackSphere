"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle, Share2, Star, MoreHorizontal, Send } from "lucide-react";

interface CommentType {
  id: string;
  postId: string;
  content: string;
  author: {
    name: string;
    avatarUrl?: string;
    subscription?: {
      plan: string;
    };
  };
  createdAt: string | Date;
}

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
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Comments states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  const handleCommentButtonClick = () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    if (nextShow && comments.length === 0) {
      loadComments();
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/comments?postId=${post.id}`);
      if (!response.ok) {
        throw new Error("Failed to load comments");
      }
      const resData = await response.json();
      if (resData.success && resData.comments) {
        setComments(resData.comments);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch("/api/comments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create comment");
      }

      const resData = await response.json();
      if (resData.success && resData.comment) {
        setComments((prev) => [...prev, resData.comment]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err: any) {
      console.error("Failed to submit comment:", err);
      alert(err.message || "An error occurred while posting your comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

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

  const handleShare = async () => {
    // 1. Copy formatted post link to user's clipboard
    const postUrl = `${window.location.origin}/social/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }

    // 2. Optimistically increment count on UI
    const prevCount = sharesCount;
    setSharesCount((prev) => prev + 1);

    // 3. Update backend API database record
    try {
      const response = await fetch("/api/posts/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to register share");
      }

      const resData = await response.json();
      if (resData.success && typeof resData.sharesCount === "number") {
        setSharesCount(resData.sharesCount);
      }
    } catch (err) {
      console.error("Post share api error:", err);
      // Fallback on total failure
      setSharesCount(prevCount);
    }
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(post.author.name)} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm`}>
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
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700/60 pt-3.5 mt-2 gap-1 flex-wrap">
        {/* Like action button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold py-1.5 px-2 sm:px-3 rounded-lg transition-all ${
            liked
              ? "text-rose-650 bg-rose-50 dark:bg-rose-950/20"
              : "text-neutral-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/10"
          }`}
        >
          <Heart className={`h-4 w-4 transition-transform duration-200 active:scale-125 ${liked ? "fill-current text-rose-650" : ""}`} />
          <span>{likesCount}</span>
        </button>

        {/* Comment action button */}
        <button
          onClick={handleCommentButtonClick}
          className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold py-1.5 px-2 sm:px-3 rounded-lg transition-all ${
            showComments
              ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20"
              : "text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </button>

        {/* Share action button */}
        <div className="relative">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 py-1.5 px-2 sm:px-3 rounded-lg transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>{sharesCount}</span>
          </button>
          {showShareToast && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap animate-bounce">
              Link copied!
            </div>
          )}
        </div>
      </div>

      {/* Comments Section Drawer */}
      {showComments && (
        <div className="border-t border-neutral-100 dark:border-neutral-700/60 pt-4 mt-3 space-y-4 animate-fadeIn">
          {/* Comments List */}
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {isLoadingComments ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-[10px] text-neutral-450 font-semibold">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-4 font-medium">
                No replies yet. Start the conversation!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 sm:gap-2.5 items-start text-xs text-neutral-700 dark:text-neutral-350">
                  {comment.author.avatarUrl ? (
                    <img
                       src={comment.author.avatarUrl}
                       alt={comment.author.name}
                       className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr ${getAvatarColor(comment.author.name)} flex items-center justify-center text-white font-bold text-[9px] sm:text-[10px] shadow-sm shrink-0`}>
                      {getInitials(comment.author.name)}
                    </div>
                  )}

                  <div className="flex-1 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-xl px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-800 dark:text-neutral-100">
                          {comment.author.name}
                        </span>
                        {comment.author.subscription?.plan && (
                          <span className={`inline-flex items-center gap-0.5 px-1 py-px text-[7px] font-bold border rounded-full ${getPlanColor(comment.author.subscription.plan)}`}>
                            <Star className="h-1.5 w-1.5 fill-current" />
                            {comment.author.subscription.plan}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed whitespace-pre-line text-neutral-600 dark:text-neutral-350">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Composer */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 sm:gap-3 pt-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "Me"}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr ${getAvatarColor(session?.user?.name || "Member")} flex items-center justify-center text-white font-bold text-[9px] sm:text-xs shadow-sm shrink-0`}>
                {getInitials(session?.user?.name || "Member")}
              </div>
            )}

            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 h-8 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-white transition-all shrink-0 shadow-sm ${
                  newComment.trim() && !isSubmittingComment
                    ? "bg-indigo-600 hover:bg-indigo-500 active:scale-95"
                    : "bg-indigo-400 cursor-not-allowed"
                }`}
              >
                {isSubmittingComment ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
