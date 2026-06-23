import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import SocialFeed from "@/components/social/SocialFeed";

export const metadata = {
  title: "Social Hub - StackSphere",
  description: "Connect with developers, share ideas, and stay updated with the latest in technology.",
};

export default async function SocialPage() {
  // Retrieve the server session using authOptions
  const session = await getServerSession(authOptions);

  // Redirect to login page if unauthorized
  if (!session || !session.user) {
    redirect("/login");
  }

  // Connect to MongoDB
  await connectToDatabase();

  // Find user data to pass current user details to client-side state
  const dbUser = await User.findById((session.user as any).id);

  if (!dbUser) {
    redirect("/login");
  }

  // Fetch posts from database, sorting by creation date descending
  const dbPosts = await Post.find()
    .populate("author", "name image avatarUrl subscription")
    .sort({ createdAt: -1 })
    .lean();

  // Map database posts into a clean serializable structure
  const initialPosts = dbPosts.map((post: any) => ({
    id: post._id.toString(),
    content: post.content,
    mediaUrl: post.mediaUrl || "",
    mediaType: post.mediaType || "none",
    author: {
      name: post.author?.name || "Deleted User",
      email: post.author?.email || "",
      avatarUrl: post.author?.avatarUrl || post.author?.image || "",
      subscription: {
        plan: post.author?.subscription?.plan || "Free",
      },
    },
    likes: (post.likes || []).map((likeId: any) => likeId.toString()),
    commentsCount: post.commentsCount || 0,
    sharesCount: post.sharesCount || 0,
    createdAt: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
  }));

  // Extract a clean serializable user object for client component props
  const currentUser = {
    id: dbUser._id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.avatarUrl || dbUser.image || "",
    plan: dbUser.subscription?.plan || "Free",
  };

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col gap-1 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Social Space
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Connect with other developers, share insights, ask questions, and follow popular tech tags.
        </p>
      </div>

      {/* Main Feed Container */}
      <SocialFeed currentUser={currentUser} initialPosts={initialPosts} />
    </div>
  );
}
