"use client";

import React, { useState } from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import { UserPlus, UserCheck, TrendingUp, Hash, Star } from "lucide-react";

interface SocialFeedProps {
  currentUser: {
    id: string;
    name: string;
    email?: string;
    image?: string;
    plan?: string;
  };
  initialPosts?: PostType[];
}

interface PostType {
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
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  createdAt: string | Date;
}

const INITIAL_POSTS: PostType[] = [
  {
    id: "post-1",
    content: "Just finished implementing the new StackSphere design system with Next.js App Router and dark mode support! The micro-animations look super slick. What do you think of the glassmorphism elements? 🚀 #nextjs #tailwind #webdev",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    author: {
      name: "Elena Rostova",
      subscription: {
        plan: "Gold",
      },
    },
    likes: ["user-2", "user-3"],
    commentsCount: 8,
    sharesCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "post-2",
    content: "Has anyone run into connection pooling issues with Mongoose on Vercel Serverless Functions? The connection is dropping after a few seconds of idle time. Tried caching the client connection object, but still seeing intermittent timeouts. Any ideas?",
    mediaType: "none",
    author: {
      name: "Marcus Chen",
      subscription: {
        plan: "Silver",
      },
    },
    likes: ["user-1"],
    commentsCount: 12,
    sharesCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "post-3",
    content: "Exploring the new WebSockets API integration for our live social updates feed. Real-time notifications and feed auto-refreshing are going to be game changers for community engagement. Here's a sneak peek of the architecture diagram!",
    mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    mediaType: "image",
    author: {
      name: "Devon Lane",
      subscription: {
        plan: "Gold",
      },
    },
    likes: ["user-1", "user-2", "user-4", "user-5"],
    commentsCount: 15,
    sharesCount: 9,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
];

const SUGGESTED_FRIENDS = [
  { id: "friend-1", name: "Sarah Connor", role: "DevOps Engineer", plan: "Gold", avatarInitials: "SC" },
  { id: "friend-2", name: "Alex Mercer", role: "Fullstack Developer", plan: "Silver", avatarInitials: "AM" },
  { id: "friend-3", name: "Lina Park", role: "UI/UX Designer", plan: "Bronze", avatarInitials: "LP" },
];

const TRENDING_TAGS = [
  { tag: "nextjs", count: "1.2k posts" },
  { tag: "typescript", count: "850 posts" },
  { tag: "tailwindcss", count: "620 posts" },
  { tag: "mongodb", count: "430 posts" },
  { tag: "webdev", count: "310 posts" },
];

export default function SocialFeed({ currentUser, initialPosts = [] }: SocialFeedProps) {
  // Use database posts if available, fallback to mock posts if DB is empty
  const [posts, setPosts] = useState<PostType[]>(
    initialPosts.length > 0 ? initialPosts : INITIAL_POSTS
  );
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handlePostCreated = async (newPostData: {
    content: string;
    mediaUrl?: string;
    mediaType: "image" | "video" | "none";
  }) => {
    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPostData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create post");
      }

      const resData = await response.json();
      if (resData.success && resData.post) {
        const createdPost: PostType = {
          id: resData.post.id,
          content: resData.post.content,
          mediaUrl: resData.post.mediaUrl || undefined,
          mediaType: resData.post.mediaType,
          author: {
            name: currentUser.name,
            avatarUrl: currentUser.image || undefined,
            subscription: {
              plan: currentUser.plan || "Free",
            },
          },
          likes: resData.post.likes || [],
          commentsCount: resData.post.commentsCount || 0,
          sharesCount: resData.post.sharesCount || 0,
          createdAt: resData.post.createdAt,
        };

        setPosts((prevPosts) => [createdPost, ...prevPosts]);
      }
    } catch (err: any) {
      console.error("Failed to submit post:", err);
      alert(err.message || "Something went wrong while posting.");
    }
  };

  const toggleFollow = (friendId: string) => {
    setFollowingStates((prev) => ({
      ...prev,
      [friendId]: !prev[friendId],
    }));
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

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "gold":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30";
      case "silver":
        return "bg-slate-100 text-slate-855 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/30";
      case "bronze":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-400 dark:border-neutral-800/30";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left/Center Column: Post Creator and Feed List */}
      <div className="lg:col-span-8 space-y-6">
        <CreatePostCard onPostCreated={handlePostCreated} />

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser.id} />
          ))}
        </div>
      </div>

      {/* Right Column: Widgets / Sidebars */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Suggested Friends Widget */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Suggested Authors
            </h3>
            <button className="text-xs font-semibold text-indigo-650 hover:text-indigo-500 transition-colors">
              See All
            </button>
          </div>

          <div className="space-y-3.5">
            {SUGGESTED_FRIENDS.map((friend) => {
              const isFollowing = followingStates[friend.id];
              return (
                <div key={friend.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarColor(friend.name)} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                      {friend.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate hover:text-indigo-600 transition-colors cursor-pointer">
                          {friend.name}
                        </h4>
                        <span className={`inline-flex items-center gap-0.5 px-1 py-px text-[7px] font-bold border rounded-full ${getPlanColor(friend.plan)}`}>
                          <Star className="h-1.5 w-1.5 fill-current" />
                          {friend.plan}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                        {friend.role}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(friend.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200 shrink-0 ${
                      isFollowing
                        ? "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
                        : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-3 w-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Hashtags Widget */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Trending Spaces
            </h3>
          </div>

          <div className="space-y-3.5">
            {TRENDING_TAGS.map((tagObj) => (
              <div
                key={tagObj.tag}
                className="flex items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 p-1.5 rounded-lg -mx-1.5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-700 flex items-center justify-center text-neutral-550 dark:text-neutral-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-all shrink-0">
                    <Hash className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-200 group-hover:text-indigo-600 transition-colors truncate">
                    #{tagObj.tag}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 shrink-0">
                  {tagObj.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
