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
    const { requestId, action } = body;

    if (!requestId || !action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "requestId and valid action ('accept' or 'reject') are required." },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Find friend request document
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return NextResponse.json(
        { error: "Friend request could not be found." },
        { status: 404 }
      );
    }

    // 5. Verify the active user is the receiver of the request
    if (request.receiver.toString() !== currentUserId) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this request." },
        { status: 403 }
      );
    }

    // 6. Verify request is still pending
    if (request.status !== "pending") {
      return NextResponse.json(
        { error: `This friend request has already been ${request.status}.` },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Update request status to accepted
      request.status = "accepted";
      await request.save();

      // Add mutual friend connections in User documents
      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: request.receiver },
      });
      await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { friends: request.sender },
      });

      return NextResponse.json({
        success: true,
        message: "Friend request accepted successfully.",
        status: "accepted",
      });
    } else {
      // Update request status to rejected
      request.status = "rejected";
      await request.save();

      return NextResponse.json({
        success: true,
        message: "Friend request declined successfully.",
        status: "rejected",
      });
    }
  } catch (error: any) {
    console.error("Respond friend request API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while responding to the friend request." },
      { status: 500 }
    );
  }
}
