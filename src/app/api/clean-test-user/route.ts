import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import LoginHistory from "@/models/LoginHistory";
import Notification from "@/models/Notification";
import FriendRequest from "@/models/FriendRequest";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Subscription from "@/models/Subscription";
import Reward from "@/models/Reward";
import Transaction from "@/models/Transaction";
import Upload from "@/models/Upload";

export async function GET() {
  try {
    await connectToDatabase();
    const targetPhone = "+918248149740";
    const users = await User.find({
      $or: [{ phoneNumber: targetPhone }, { phoneNumber: "8248149740" }],
    });

    if (users.length === 1) {
      const user = users[0];
      const userId = user._id;

      await OTPChallenge.deleteMany({
        $or: [{ userId }, { destination: targetPhone }, { destination: "8248149740" }],
      });
      await LoginHistory.deleteMany({ userId });
      await Notification.deleteMany({ userId });
      await FriendRequest.deleteMany({
        $or: [{ sender: userId }, { recipient: userId }],
      });
      await User.updateMany({ friends: userId }, { $pull: { friends: userId } });
      await Subscription.deleteMany({ userId });
      await Reward.deleteMany({ userId });
      await Transaction.deleteMany({
        $or: [{ senderId: userId }, { recipientId: userId }],
      });
      await Upload.deleteMany({ userId });
      await Post.deleteMany({ author: userId });
      await Comment.deleteMany({ author: userId });

      await User.deleteOne({ _id: userId });

      return NextResponse.json({
        matchCount: 1,
        removed: true,
        available: true,
      });
    }

    return NextResponse.json({
      matchCount: users.length,
      removed: false,
      available: users.length === 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
