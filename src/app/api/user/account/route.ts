import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import LoginHistory from "@/models/LoginHistory";
import Notification from "@/models/Notification";
import FriendRequest from "@/models/FriendRequest";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import Reward from "@/models/Reward";
import Subscription from "@/models/Subscription";
import Transaction from "@/models/Transaction";
import Upload from "@/models/Upload";
import { deleteMedia } from "@/utils/cloudinary";

export async function DELETE(req: Request) {
  try {
    // 1. Authenticated server session required
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const { password, confirmation } = body;

    // 2. Validate confirmation text 'DELETE'
    if (!confirmation || String(confirmation).trim() !== "DELETE") {
      return NextResponse.json(
        { error: "Please type DELETE to confirm account deletion." },
        { status: 400 }
      );
    }

    // 3. Validate password presence
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Current password is required to confirm account deletion." },
        { status: 400 }
      );
    }

    // 4. Connect to database & retrieve user securely
    await connectToDatabase();
    const user = await User.findById(currentUserId).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // 5. Verify current password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion blocked." },
        { status: 400 }
      );
    }

    // 6. Data Cleanup & Removal
    const userId = user._id;

    // A. Private Account Records
    await OTPChallenge.deleteMany({ userId });
    await LoginHistory.deleteMany({ userId });
    await Notification.deleteMany({ userId });
    await FriendRequest.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    });

    // B. Friend Relationships - Remove deleted user from other users' friend lists
    await User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // C. Subscriptions, Rewards, Transactions & Upload Records
    await Subscription.deleteMany({ userId });
    await Reward.deleteMany({ userId });
    await Transaction.deleteMany({
      $or: [{ senderId: userId }, { recipientId: userId }],
    });
    await Upload.deleteMany({ userId });

    // D. Social Posts & Cloudinary Media Cleanup
    const userPosts = await Post.find({ author: userId });
    for (const post of userPosts) {
      if (post.mediaPublicId) {
        try {
          await deleteMedia(post.mediaPublicId);
        } catch (mediaErr) {
          console.warn("Failed to delete post media on Cloudinary:", mediaErr);
        }
      }
    }
    await Post.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });

    // E. Public Q&A Anonymization (preserve public thread discussions without active profile references)
    await Question.updateMany(
      { author: userId },
      {
        $set: {
          authorName: "Deleted User",
          authorEmail: "deleted@stacksphere.com",
          isAnonymized: true,
        },
        $unset: {
          author: 1,
        },
      }
    );

    await Answer.updateMany(
      { author: userId },
      {
        $set: {
          authorName: "Deleted User",
          isAnonymized: true,
        },
        $unset: {
          author: 1,
        },
      }
    );

    // F. Permanently Delete User Document
    await User.deleteOne({ _id: userId });

    return NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during account deletion." },
      { status: 500 }
    );
  }
}
