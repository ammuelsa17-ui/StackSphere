import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";

export async function GET(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    const currentUserId = (session.user as any).id;

    // 2. Parse search query parameter
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.trim() === "") {
      return NextResponse.json({ success: true, users: [] });
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Fetch search results (exclude active user)
    const matchedUsers = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email avatarUrl image subscription friends")
      .limit(10)
      .lean();

    // 5. Fetch all request states involving the active user to annotate results
    const requests = await FriendRequest.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).lean();

    // 6. Map and annotate search users with relationship status
    const annotatedUsers = matchedUsers.map((user: any) => {
      const isFriend = user.friends?.some(
        (id: any) => id.toString() === currentUserId
      );

      let relationship = "none";
      let requestId = "";

      if (isFriend) {
        relationship = "friends";
      } else {
        const matchingRequest = requests.find(
          (req: any) =>
            (req.sender.toString() === currentUserId &&
              req.receiver.toString() === user._id.toString()) ||
            (req.sender.toString() === user._id.toString() &&
              req.receiver.toString() === currentUserId)
        );

        if (matchingRequest && matchingRequest.status === "pending") {
          requestId = matchingRequest._id.toString();
          if (matchingRequest.sender.toString() === currentUserId) {
            relationship = "sent";
          } else {
            relationship = "received";
          }
        }
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || user.image || "",
        subscription: {
          plan: user.subscription?.plan || "Free",
        },
        relationship,
        requestId,
      };
    });

    return NextResponse.json({
      success: true,
      users: annotatedUsers,
    });
  } catch (error: any) {
    console.error("User search API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during user search query." },
      { status: 500 }
    );
  }
}
