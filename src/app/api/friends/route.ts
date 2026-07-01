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

    // 2. Extract type query parameter (list or requests)
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "list";

    // 3. Connect to database
    await connectToDatabase();

    if (type === "requests") {
      // Fetch incoming pending friend requests
      const pendingRequests = await FriendRequest.find({
        receiver: currentUserId,
        status: "pending",
      })
        .populate("sender", "name email avatarUrl image subscription")
        .sort({ createdAt: -1 })
        .lean();

      const requests = pendingRequests.map((req: any) => ({
        id: req._id.toString(),
        sender: {
          id: req.sender._id.toString(),
          name: req.sender.name,
          email: req.sender.email,
          avatarUrl: req.sender.avatarUrl || req.sender.image || "",
          subscription: {
            plan: req.sender.subscription?.plan || "Free",
          },
        },
        createdAt: req.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        requests,
      });
    } else {
      // Fetch current accepted friends list
      const dbUser = await User.findById(currentUserId)
        .populate("friends", "name email avatarUrl image subscription")
        .lean();

      if (!dbUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const friends = (dbUser.friends || []).map((friend: any) => ({
        id: friend._id.toString(),
        name: friend.name,
        email: friend.email,
        avatarUrl: friend.avatarUrl || friend.image || "",
        subscription: {
          plan: friend.subscription?.plan || "Free",
        },
      }));

      return NextResponse.json({
        success: true,
        friends,
      });
    }
  } catch (error: any) {
    console.error("Friends fetch API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading friends data." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    const currentUserId = (session.user as any).id;

    // 2. Parse request body for target friend ID
    const body = await req.json();
    const { friendId } = body;

    if (!friendId || friendId.trim() === "") {
      return NextResponse.json(
        { error: "Friend ID is required for removal." },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Remove connections mutually
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: currentUserId },
    });

    // 5. Update any existing accepted friend request document status to rejected/deleted
    // to allow sending requests again in the future if desired
    await FriendRequest.deleteMany({
      $or: [
        { sender: currentUserId, receiver: friendId },
        { sender: friendId, receiver: currentUserId },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Friend removed successfully.",
    });
  } catch (error: any) {
    console.error("Remove friend API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while removing your friend." },
      { status: 500 }
    );
  }
}
