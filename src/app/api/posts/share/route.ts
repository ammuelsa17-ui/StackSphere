import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
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
    const { postId } = body;

    // 4. Validate input
    if (!postId || postId.trim() === "") {
      return NextResponse.json(
        { error: "Post ID is required." },
        { status: 400 }
      );
    }

    // 5. Connect to the database
    await connectToDatabase();

    // 6. Find target post and atomically increment shares count
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true } // return the updated document
    );

    if (!post) {
      return NextResponse.json(
        { error: "Post could not be found." },
        { status: 404 }
      );
    }

    // 7. Respond with the updated count details
    return NextResponse.json({
      success: true,
      sharesCount: post.sharesCount || 0,
    });
  } catch (error: any) {
    console.error("Post share increment error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the post share." },
      { status: 500 }
    );
  }
}
