import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";

/**
 * POST /api/subscription/cancel
 * Cancellation Policy: IMMEDIATE
 * Resets user subscription plan to "Free" (1 question/day allowance).
 * Cancellation is NOT a payment, so it is NOT restricted to the 10:00 - 11:00 AM IST payment window.
 * Preserves all historical Transaction records in MongoDB Atlas.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in to manage subscription." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    const currentPlan = user.subscriptionPlan || user.subscription?.plan || "Free";
    if (currentPlan === "Free") {
      return NextResponse.json(
        { error: "You are currently on the Free plan. No active subscription to cancel." },
        { status: 400 }
      );
    }

    // Apply IMMEDIATE Cancellation Policy: Reset plan to Free
    user.subscriptionPlan = "Free";
    user.dailyQuestionLimit = SUBSCRIPTION_PLANS["Free"].dailyQuestionLimit;
    if (user.subscription) {
      user.subscription.plan = "Free";
      user.subscription.paymentStatus = "cancelled";
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Subscription successfully cancelled. Your plan has been reset to Free.",
        subscriptionPlan: "Free",
        dailyQuestionLimit: 1,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Subscription Cancellation Error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription cancellation." },
      { status: 500 }
    );
  }
}
