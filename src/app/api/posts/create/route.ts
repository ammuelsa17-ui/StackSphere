import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import Upload from "@/models/Upload";
import User from "@/models/User";
import { sanitizeString } from "@/utils/validation";
import { getDailyPostLimit } from "@/lib/socialPostingPolicy";

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

    const contentClean = sanitizeString(content);

    // 4. Validate required content field
    if (!contentClean) {
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
    const dailyLimit = getDailyPostLimit(friendCount);

    if (dailyLimit === 0) {
      return NextResponse.json(
        { error: "Posting is blocked until you add at least 1 friend.", code: "POSTING_BLOCKED" },
        { status: 403 }
      );
    }

    if (dailyLimit !== Infinity) {
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
            error: `Daily post limit reached based on your friend count.`,
            code: "DAILY_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    // 7. Verification: If media is provided, ensure it exists in Upload collection
    let verifiedMediaUrl = "";
    let verifiedMediaType: "image" | "video" | "none" = "none";

    if (mediaUrl && normalizedMediaType !== "none") {
      const uploadDoc = await Upload.findOne({
        url: mediaUrl,
        user: userId,
      });

      if (!uploadDoc) {
        return NextResponse.json(
          { error: "Provided media file was not found in your uploads." },
          { status: 400 }
        );
      }

      verifiedMediaUrl = uploadDoc.url;
      verifiedMediaType = uploadDoc.fileType as "image" | "video";
    }

    // 8. Create the Post document
    const newPost = await Post.create({
      author: userId,
      content: contentClean,
      mediaUrl: verifiedMediaUrl,
      mediaType: verifiedMediaType,
      likes: [],
      shares: 0,
      createdAt: new Date(),
    });

    // Populate author details for client response
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "name avatarUrl subscription friends")
      .lean();

    return NextResponse.json(
      {
        message: "Post published successfully!",
        post: {
          _id: (populatedPost as any)._id.toString(),
          author: (populatedPost as any).author,
          content: (populatedPost as any).content,
          mediaUrl: (populatedPost as any).mediaUrl,
          mediaType: (populatedPost as any).mediaType,
          likes: (populatedPost as any).likes || [],
          shares: (populatedPost as any).shares || 0,
          createdAt: (populatedPost as any).createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error creating post." },
      { status: 500 }
    );
  }
}
