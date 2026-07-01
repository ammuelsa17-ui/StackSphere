import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }
    const currentUserId = (session.user as any).id;

    // 2. Parse and validate parameters
    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId || receiverId.trim() === "") {
      return NextResponse.json(
        { error: "Receiver ID is required." },
        { status: 400 }
      );
    }

    if (currentUserId === receiverId) {
      return NextResponse.json(
        { error: "You cannot send a friend request to yourself." },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Verify receiver user exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json(
        { error: "Target user could not be found." },
        { status: 404 }
      );
    }

    // 5. Check if they are already friends
    const isAlreadyFriend = receiver.friends?.some(
      (id: any) => id.toString() === currentUserId
    );
    if (isAlreadyFriend) {
      return NextResponse.json(
        { error: "You are already friends with this user." },
        { status: 400 }
      );
    }

    // 6. Check if an active request already exists (either sender to receiver, or vice versa)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending friend request already exists between you." },
        { status: 400 }
      );
    }

    // 7. Create new pending friend request document
    const newRequest = await FriendRequest.create({
      sender: currentUserId,
      receiver: receiverId,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Friend request sent successfully.",
        request: {
          id: newRequest._id.toString(),
          sender: currentUserId,
          receiver: receiverId,
          status: newRequest.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Send friend request API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the friend request." },
      { status: 500 }
    );
  }
}
