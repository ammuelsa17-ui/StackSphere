import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

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
    const { postId, content } = body;

    // 4. Validate inputs
    if (!postId || postId.trim() === "") {
      return NextResponse.json(
        { error: "Post ID is required." },
        { status: 400 }
      );
    }

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content cannot be empty." },
        { status: 400 }
      );
    }

    // 5. Connect to the database
    await connectToDatabase();

    // 6. Verify that the post exists
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return NextResponse.json(
        { error: "Target post could not be found." },
        { status: 404 }
      );
    }

    // 7. Create the comment document
    const newComment = await Comment.create({
      postId,
      author: (session.user as any).id,
      content: content.trim(),
    });

    // 8. Increment comments count in post document
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // 9. Fetch populated comment with author details
    const populatedComment = await Comment.findById(newComment._id)
      .populate("author", "name image avatarUrl subscription")
      .lean();

    if (!populatedComment) {
      throw new Error("Failed to retrieve populated comment document.");
    }

    const authorObj = populatedComment.author as any;

    // 10. Respond with clean serialized comment details
    return NextResponse.json(
      {
        success: true,
        comment: {
          id: populatedComment._id.toString(),
          postId: populatedComment.postId.toString(),
          content: populatedComment.content,
          author: {
            name: authorObj?.name || "StackSphere Member",
            email: authorObj?.email || "",
            avatarUrl: authorObj?.avatarUrl || authorObj?.image || "",
            subscription: {
              plan: authorObj?.subscription?.plan || "Free",
            },
          },
          createdAt: (populatedComment as any).createdAt ? (populatedComment as any).createdAt.toISOString() : new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while posting your comment." },
      { status: 500 }
    );
  }
}
