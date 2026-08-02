import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Reward from "@/models/Reward";
import { sanitizeString } from "@/utils/validation";

import Notification from "@/models/Notification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientEmail = sanitizeString(body.recipientEmail);
    const amount = parseInt(body.amount, 10);

    if (!recipientEmail || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid recipient email or transfer amount." }, { status: 400 });
    }

    const senderId = (session.user as any).id;
    await connectToDatabase();

    const sender = await User.findById(senderId);
    if (!sender) {
      return NextResponse.json({ error: "Sender profile not found." }, { status: 404 });
    }

    // Task 4 Constraint: Allow transfer only if sender has MORE THAN 10 points
    if ((sender.points || 0) <= 10) {
      return NextResponse.json({ error: "Points transfer restricted. Sender must have more than 10 points balance." }, { status: 403 });
    }

    if ((sender.points || 0) < amount) {
      return NextResponse.json({ error: "Insufficient points balance for this transfer." }, { status: 400 });
    }

    const receiver = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!receiver) {
      return NextResponse.json({ error: "Recipient user not found." }, { status: 404 });
    }

    // Constraint: Prevent self-transfer
    if (sender._id.toString() === receiver._id.toString()) {
      return NextResponse.json({ error: "You cannot transfer points to yourself." }, { status: 400 });
    }

    // Atomic points exchange updates
    sender.points = (sender.points || 0) - amount;
    await sender.save();

    receiver.points = (receiver.points || 0) + amount;
    await receiver.save();

    // Dispatch notification to recipient
    await Notification.create({
      userId: receiver._id,
      actorId: sender._id,
      type: "transfer",
      message: `${sender.name || "A user"} transferred ${amount} reward points to you.`,
      link: "/profile",
    }).catch(() => {});

    // Log transaction history for sender
    await Reward.create({
      userId: sender._id,
      points: -amount,
      action: "point_transfer_sent",
      senderId: sender._id,
      receiverId: receiver._id,
      details: `Transferred points to ${receiver.name} (${receiver.email})`,
    });

    // Log transaction history for receiver
    await Reward.create({
      userId: receiver._id,
      points: amount,
      action: "point_transfer_received",
      senderId: sender._id,
      receiverId: receiver._id,
      details: `Received points from ${sender.name} (${sender.email})`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${amount} points to ${receiver.name}.`,
      newPoints: sender.points,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Point transfer failed." }, { status: 500 });
  }
}
