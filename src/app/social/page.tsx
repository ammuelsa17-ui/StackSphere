import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import SocialFeed from "@/components/social/SocialFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Social Hub - StackSphere",
  description: "Connect with developers, share ideas, and stay updated with the latest in technology.",
};

export default async function SocialPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  await connectToDatabase();

  const dbUser = await User.findById((session.user as any).id);

  if (!dbUser) {
    redirect("/login");
  }

  const dbPosts = await Post.find()
    .populate("author", "name email image avatarUrl subscription")
    .sort({ createdAt: -1 })
    .lean();

  const initialPosts = dbPosts.map((post: any) => ({
    id: post._id.toString(),
    author: {
      id: post.author._id.toString(),
      name: post.author.name || "Anonymous",
      email: post.author.email || "",
      avatarUrl: post.author.avatarUrl || post.author.image || "",
      subscription: {
        plan: post.author.subscription?.plan || post.author.subscriptionPlan || "Free",
      },
    },
    content: post.content,
    mediaUrl: post.mediaUrl || "",
    mediaType: post.mediaType || "none",
    likes: post.likes ? post.likes.map((l: any) => l.toString()) : [],
    sharesCount: post.sharesCount || 0,
    commentsCount: post.comments ? post.comments.length : 0,
    createdAt: post.createdAt.toISOString(),
  }));

  const userPlan = dbUser.subscription?.plan || dbUser.subscriptionPlan || "Free";

  const currentUser = {
    id: (session.user as any).id,
    name: dbUser.name || session.user.name || "User",
    email: dbUser.email || session.user.email || "",
    image: dbUser.avatarUrl || session.user.image || "",
    plan: userPlan,
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <SocialFeed
        currentUser={currentUser}
        initialPosts={initialPosts}
      />
    </div>
  );
}
