import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Reward from "@/models/Reward";
import Notification from "@/models/Notification";
import { sanitizeString } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const recipientEmail = sanitizeString(body.recipientEmail);
    const amount = parseInt(body.amount, 10);
    const idempotencyKey = sanitizeString(body.idempotencyKey || body.requestId);

    if (!recipientEmail || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid recipient email or transfer amount." }, { status: 400 });
    }

    const senderId = (session.user as any).id;
    const mongoose = await connectToDatabase();

    // Idempotency check: if an existing transfer with this idempotency key exists, return previous result
    if (idempotencyKey) {
      const existingTx = await Reward.findOne({
        userId: senderId,
        action: "point_transfer_sent",
        details: { $regex: idempotencyKey, $options: "i" },
      });
      if (existingTx) {
        return NextResponse.json({
          success: true,
          message: "Transfer already completed (Idempotent replay).",
          isIdempotentReplay: true,
        }, { status: 200 });
      }
    }

    const receiver = await User.findOne({ email: recipientEmail.toLowerCase() });
    if (!receiver) {
      return NextResponse.json({ error: "Recipient user not found." }, { status: 404 });
    }

    if (senderId.toString() === receiver._id.toString()) {
      return NextResponse.json({ error: "You cannot transfer points to yourself." }, { status: 400 });
    }

    // Atomic conditional deduction on sender balance:
    // Requires: points > 10 AND points >= amount
    const updatedSender = await User.findOneAndUpdate(
      {
        _id: senderId,
        points: { $gt: 10, $gte: amount },
      },
      {
        $inc: { points: -amount },
      },
      { new: true }
    );

    if (!updatedSender) {
      // Check why update failed to supply precise error message
      const currentSender = await User.findById(senderId);
      if (!currentSender) {
        return NextResponse.json({ error: "Sender profile not found." }, { status: 404 });
      }
      if ((currentSender.points || 0) <= 10) {
        return NextResponse.json({ error: "Points transfer restricted. Sender must have more than 10 points balance." }, { status: 403 });
      }
      return NextResponse.json({ error: "Insufficient points balance for this transfer." }, { status: 400 });
    }

    try {
      // Credit receiver atomically
      await User.updateOne(
        { _id: receiver._id },
        { $inc: { points: amount } }
      );

      // Create ledger entries
      const idempotencyTag = idempotencyKey ? ` [Key: ${idempotencyKey}]` : "";
      
      await Reward.create({
        userId: senderId,
        points: -amount,
        action: "point_transfer_sent",
        senderId: senderId,
        receiverId: receiver._id,
        details: `Transferred points to ${receiver.name} (${receiver.email})${idempotencyTag}`,
      });

      await Reward.create({
        userId: receiver._id,
        points: amount,
        action: "point_transfer_received",
        senderId: senderId,
        receiverId: receiver._id,
        details: `Received points from ${session.user.name || "A user"} (${session.user.email})${idempotencyTag}`,
      });

      // Send notification
      await Notification.create({
        userId: receiver._id,
        actorId: senderId,
        type: "transfer",
        message: `${session.user.name || "A user"} transferred ${amount} reward points to you.`,
        link: "/profile",
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Successfully transferred ${amount} points to ${receiver.name}.`,
        newPoints: updatedSender.points,
      }, { status: 200 });

    } catch (txnError: any) {
      // Rollback sender deduction on failure
      await User.updateOne(
        { _id: senderId },
        { $inc: { points: amount } }
      );
      throw new Error(`Point transfer failed during execution: ${txnError.message}. Sender balance restored.`);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Point transfer failed." }, { status: 500 });
  }
}
