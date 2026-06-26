import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(req: Request) {
  try {
    // 1. Get the current active session
    const session = await getServerSession(authOptions);

    // 2. Reject if the user is unauthenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 3. Parse pagination queries
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));

    // 4. Connect to the database
    await connectToDatabase();

    // 5. Query posts chronologically (newest first)
    const dbPosts = await Post.find()
      .populate("author", "name image avatarUrl subscription")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 6. Map database results to a clean serializable schema
    const posts = dbPosts.map((post: any) => ({
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

    // 7. Respond with the posts list
    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: any) {
    console.error("Feed retrieval error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the social feed." },
      { status: 500 }
    );
  }
}
