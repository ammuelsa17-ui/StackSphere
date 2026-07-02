import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import Upload from "@/models/Upload";
import User from "@/models/User";

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
    const { content, mediaUrl, mediaType } = body;

    // 4. Validate required content field
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Post content cannot be empty." },
        { status: 400 }
      );
    }

    // 5. Validate mediaType if provided
    const validMediaTypes = ["image", "video", "none"];
    const normalizedMediaType = mediaType || "none";
    if (!validMediaTypes.includes(normalizedMediaType)) {
      return NextResponse.json(
        { error: "Invalid media type format." },
        { status: 400 }
      );
    }

    // 6. Connect to the database
    await connectToDatabase();

    // 6b. Retrieve user and verify friend-count based limitations
    const userId = (session.user as any).id;
    const dbUser = await User.findById(userId).select("friends").lean();
    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    const friendCount = dbUser.friends?.length || 0;

    if (friendCount === 0) {
      return NextResponse.json(
        { error: "You cannot create a post because you have 0 friends. Please add at least 1 friend to start posting." },
        { status: 403 }
      );
    }

    // Determine daily post limit based on friend count
    let dailyLimit = 5; // standard limit for 3+ friends
    if (friendCount === 1) dailyLimit = 1;
    else if (friendCount === 2) dailyLimit = 2;

    // Calculate start of current UTC calendar day
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Count user's posts created today
    const postCountToday = await Post.countDocuments({
      author: userId,
      createdAt: { $gte: startOfToday },
    });

    if (postCountToday >= dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily posting limit reached. With ${friendCount} friend${
            friendCount === 1 ? "" : "s"
          }, you can post up to ${dailyLimit} time${dailyLimit === 1 ? "" : "s"} per day.`,
        },
        { status: 403 }
      );
    }

    // 7. Create the new post in the database
    const newPost = await Post.create({
      author: (session.user as any).id,
      content: content.trim(),
      mediaUrl: mediaUrl || "",
      mediaType: normalizedMediaType,
      likes: [],
      commentsCount: 0,
      sharesCount: 0,
    });

    // 8. If post includes media, link the upload record to this post
    if (mediaUrl && mediaUrl.trim() !== "") {
      try {
        await Upload.findOneAndUpdate(
          {
            url: mediaUrl,
            uploader: (session.user as any).id,
          },
          {
            associatedPost: newPost._id,
          }
        );
      } catch (err) {
        console.error("Failed to link upload metadata to post:", err);
        // Do not fail the request if database link fails, just log it.
      }
    }

    // 8. Respond with the created post
    return NextResponse.json(
      {
        success: true,
        post: {
          id: newPost._id.toString(),
          content: newPost.content,
          mediaUrl: newPost.mediaUrl,
          mediaType: newPost.mediaType,
          likes: newPost.likes,
          commentsCount: newPost.commentsCount,
          sharesCount: newPost.sharesCount,
          createdAt: newPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Post creation error:", error);

    // Intercept Mongoose schema validation failures
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages[0] || "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during post creation." },
      { status: 500 }
    );
  }
}
