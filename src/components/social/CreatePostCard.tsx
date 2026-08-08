"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Image, Video, Send, X, Star, AlertCircle } from "lucide-react";

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
          Join the StackSphere Social Space
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          Create an account or sign in to connect with fellow developers, share media updates, and participate in community discussions!
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="/register"
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
          >
            Create Account
          </a>
          <a
            href="/login"
            className="px-4 py-2 text-xs font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            Sign In
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
      "from-blue-500 to-indigo-600",
      "from-violet-500 to-fuchsia-600",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-pink-600",
    ];
    return colors[charSum % colors.length];
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const userPlan = currentUser?.plan || "Free";
    if (userPlan === "Free") {
      alert("Only premium subscribers (Bronze, Silver, Gold plans) can attach images or videos to posts. Please upgrade your subscription plan in the Dashboard to unlock media uploads.");
      // Reset input value to prevent triggering file picker again with same file
      if (e.target) e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File Format Validation
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      alert("Unsupported file format! Please upload an image (PNG, JPG, WEBP) or video (MP4, WEBM).");
      if (e.target) e.target.value = "";
      return;
    }

    // 2. File Size Validation
    const maxSizeBytes = userPlan.toLowerCase() === "gold" 
      ? 15 * 1024 * 1024 // Gold: 15MB
      : userPlan.toLowerCase() === "silver"
      ? 10 * 1024 * 1024 // Silver: 10MB
      : 5 * 1024 * 1024; // Bronze: 5MB

    if (file.size > maxSizeBytes) {
      const sizeLabel = userPlan.toLowerCase() === "gold" ? "15MB" : userPlan.toLowerCase() === "silver" ? "10MB" : "5MB";
      alert(`File size exceeds limit! Your subscription plan (${userPlan}) allows media uploads up to ${sizeLabel}.`);
      if (e.target) e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading ${type}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const resData = await response.json();
      if (resData.success && resData.url) {
        setMediaUrl(resData.url);
        setMediaType(resData.type);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred during file upload.";
      console.error("Upload error:", err);
      alert(errMsg);
      removeMedia();
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  const handleAddMockImage = () => {
    const userPlan = currentUser?.plan || "Free";
    if (userPlan === "Free") {
      alert("Only premium subscribers (Bronze, Silver, Gold plans) can attach images or videos to posts. Please upgrade your subscription plan in the Dashboard to unlock media uploads.");
      return;
    }

    const mockImages = [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setMediaUrl(randomImg);
    setMediaType("image");
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaType("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaType === "none") return;

    setIsSubmitting(true);
    
    try {
      if (onPostCreated) {
        await onPostCreated({
          content,
          mediaUrl: mediaUrl || undefined,
          mediaType,
        });
      }
      // Reset state
      setContent("");
      removeMedia();
      setIsExpanded(false);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostBlocked = (currentUser?.friendCount === 0) || 
                        (currentUser?.dailyLimit !== Infinity && currentUser?.remainingPosts === 0);
  
  const blockReason = currentUser?.friendCount === 0 
    ? "Posting is blocked because you have 0 friends. Add at least 1 friend to start sharing posts!"
    : "Daily posting limit reached for today. You can post up to 1 post/day with 1 friend, or 2 posts/day with 2 to 10 friends. Add more than 10 friends to unlock unlimited posting!";

  const userName = session?.user?.name || "StackSphere Member";
  const userPlan = (session?.user as any)?.subscription?.plan || "Bronze";

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
              placeholder={isPostBlocked ? "Posting is restricted. See reason below." : "Share your thoughts, tech insights, or ask a question..."}
              rows={isExpanded ? 3 : 1}
              className="w-full bg-transparent text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none text-sm py-2 leading-relaxed disabled:opacity-60"
            />

            {/* Day 52: Social Posting Limit Tracker */}
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold flex items-center justify-between mt-1 pt-1 border-t border-neutral-100 dark:border-neutral-750/30">
              <span>Friends: <strong>{currentUser?.friendCount ?? 0}</strong></span>
              <span>
                {currentUser?.dailyLimit === Infinity ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Unlimited Posting (11+ Friends)</span>
                ) : (
                  <span>
                    Posts Today: <strong>{currentUser?.postsCountToday ?? 0} / {currentUser?.dailyLimit ?? 0}</strong> 
                    { (currentUser?.remainingPosts ?? 0) === 0 ? (
                      <span className="text-rose-500 font-bold ml-1.5">(Limit Reached)</span>
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
              <span className="font-bold block mb-0.5">Posting Access Restricted</span>
              {blockReason}
            </div>
          </div>
        )}

        {/* Media Preview Box or Uploading State */}
        {(mediaUrl || isUploading) && (
          <div className="relative rounded-xl overflow-hidden border border-neutral-150 dark:border-neutral-700/60 min-h-[150px] max-h-[250px] bg-neutral-50 dark:bg-neutral-900/20 ml-11 sm:ml-14 flex items-center justify-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {uploadStatus}
                </span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2.5 right-2.5 z-10 bg-neutral-900/80 hover:bg-neutral-900 text-white p-1 rounded-full backdrop-blur-sm transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
                {mediaType === "video" ? (
                  <video src={mediaUrl!} controls className="w-full h-full object-cover max-h-[250px]" />
                ) : (
                  <img src={mediaUrl!} alt="Attached preview" className="w-full h-full object-cover max-h-[250px]" />
                )}
              </>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        {isExpanded && (
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700/60 ml-11 sm:ml-14">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "image")}
              />
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "video")}
              />

              {/* Photo Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-neutral-500 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                title="Upload Image"
              >
                <Image className="h-4.5 w-4.5" />
              </button>

              {/* Video Upload Trigger */}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-2 rounded-lg text-neutral-500 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                title="Upload Video"
              >
                <Video className="h-4.5 w-4.5" />
              </button>

              {/* Quick Mock Image Button */}
              <button
                type="button"
                onClick={handleAddMockImage}
                className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-md transition-all ml-1.5"
                title="Attach premium mock image"
              >
                + Premium Photo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || isUploading || (!content.trim() && mediaType === "none")}
                className={`flex items-center gap-1.5 px-4.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all duration-200 ${
                  (content.trim() || mediaType !== "none") && !isUploading && !isSubmitting
                    ? "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]"
                    : "bg-indigo-400 text-indigo-200/80 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>{isSubmitting ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
