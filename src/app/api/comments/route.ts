import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";

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

    // 3. Extract postId query parameter
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    // 4. Validate query parameter
    if (!postId || postId.trim() === "") {
      return NextResponse.json(
        { error: "postId query parameter is required." },
        { status: 400 }
      );
    }

    // 5. Connect to the database
    await connectToDatabase();

    // 6. Query comments for the given post (chronological order, oldest first)
    const dbComments = await Comment.find({ postId })
      .populate("author", "name image avatarUrl subscription")
      .sort({ createdAt: 1 })
      .lean();

    // 7. Map database records to clean serialized format
    const comments = dbComments.map((c: any) => ({
      id: c._id.toString(),
      postId: c.postId.toString(),
      content: c.content,
      author: {
        name: c.author?.name || "Deleted User",
        email: c.author?.email || "",
        avatarUrl: c.author?.avatarUrl || c.author?.image || "",
        subscription: {
          plan: c.author?.subscription?.plan || "Free",
        },
      },
      createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
    }));

    // 8. Respond with the comments list
    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error: any) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading post comments." },
      { status: 500 }
    );
  }
}
