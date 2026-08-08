"use client";

import React, { useState } from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import FriendManager from "./FriendManager";
import { TrendingUp, Hash } from "lucide-react";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [socialAllowance, setSocialAllowance] = useState<{
    friends: number;
    postsToday: number;
    dailyLimit: number | string;
    remaining: number | string;
    canPost: boolean;
  }>({
    friends: 0,
    postsToday: 0,
    dailyLimit: 0,
    remaining: 0,
    canPost: false,
  });

  const fetchPostsAndAllowance = async () => {
    try {
      const response = await fetch("/api/posts?page=1&limit=10");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          if (resData.posts && resData.posts.length > 0) {
            setPosts(resData.posts);
          }
          if (resData.socialAllowance) {
            setSocialAllowance(resData.socialAllowance);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching social feed and allowance:", err);
    }
  };

  React.useEffect(() => {
    fetchPostsAndAllowance();
  }, []);

  const loadMorePosts = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/posts?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Failed to load more posts");
      }

      const resData = await response.json();
      if (resData.success && resData.posts) {
        const newPosts: PostType[] = resData.posts;
        if (newPosts.length < 10) {
          setHasMore(false);
        }
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setPage(nextPage);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred while loading more posts.";
      console.error("Failed to load more posts:", err);
      alert(errMsg);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
        fetchPostsAndAllowance();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong while posting.";
      console.error("Failed to submit post:", err);
      alert(errMsg);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 lg:gap-8 items-start">
      {/* Left/Center Column: Post Creator and Feed List */}
      <div className="md:col-span-7 lg:col-span-8 space-y-6">
        {/* Social Posting Status Card */}
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                👥
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Social Posting Status
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Friends: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{socialAllowance.friends}</strong> • Posts Today: <strong className="font-semibold text-neutral-800 dark:text-neutral-200">{socialAllowance.postsToday} / {socialAllowance.dailyLimit}</strong>
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              socialAllowance.friends === 0
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                : socialAllowance.canPost
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}>
              {socialAllowance.friends === 0 ? "Posting Unavailable" : socialAllowance.remaining === "Unlimited" ? "Unlimited Posting" : `${socialAllowance.remaining} Remaining Today`}
            </span>
          </div>

          {socialAllowance.friends === 0 ? (
            <div className="bg-rose-50/70 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                ⚠️ You need at least one friend to post publicly.
              </p>
              <a
                href="/social?tab=friends"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-block"
              >
                Find Friends & Build Network →
              </a>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-700/50">
              💡 Rule: 1 friend = 1 post/day • 2–10 friends = 2 posts/day • &gt;10 friends = Unlimited posts
            </p>
          )}
        </div>

        <CreatePostCard currentUser={currentUser} onPostCreated={handlePostCreated} />

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser.id} />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMorePosts}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-all duration-200 shadow-sm flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-indigo-650/30 border-t-indigo-600 rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Posts</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Widgets / Sidebars */}
      <div className="md:col-span-5 lg:col-span-4 space-y-6">
              {/* Dynamic Friend Request & List Management Widget */}
        <FriendManager />

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
