import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

import Notification from "@/models/Notification";

export async function POST(req: Request) {
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

    // 3. Parse and extract request body properties
    const body = await req.json();
    const { postId } = body;

    // 4. Validate required postId field
    if (!postId || postId.trim() === "") {
      return NextResponse.json(
        { error: "Post ID is required." },
        { status: 400 }
      );
    }

    // 5. Connect to the database
    await connectToDatabase();

    // 6. Find the target post document
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: "Post could not be found." },
        { status: 404 }
      );
    }

    // 7. Toggle user ID in post's likes array
    const userId = (session.user as any).id;
    const hasLiked = post.likes.some((id: any) => id.toString() === userId);

    if (hasLiked) {
      // Unlike: remove userId from likes array
      post.likes = post.likes.filter((id: any) => id.toString() !== userId);
    } else {
      // Like: append userId to likes array
      post.likes.push(userId);
      if (post.author && post.author.toString() !== userId) {
        await Notification.create({
          userId: post.author,
          actorId: userId,
          type: "like",
          message: `${session.user.name || "A user"} liked your post.`,
          link: "/social",
        }).catch(() => {});
      }
    }

    // 8. Save updated post document
    await post.save();

    // 9. Respond with toggle status and total count
    return NextResponse.json({
      success: true,
      liked: !hasLiked,
      likesCount: post.likes.length,
    });
  } catch (error: any) {
    console.error("Post like/unlike error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during the post like operation." },
      { status: 500 }
    );
  }
}
