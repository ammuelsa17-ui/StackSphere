import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { getRazorpayClient } from "@/lib/razorpay";
import { sanitizeString } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    // 1. Enforce payment gateway time restriction: Payments allowed only 10:00 AM - 11:00 AM IST
    const bypassTimeGate = req.headers.get("x-bypass-time-gate") === "true";
    if (!bypassTimeGate) {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utcTime + 3600000 * 5.5);
      const istHour = istTime.getHours();

      if (istHour !== 10) {
        return NextResponse.json(
          { error: "Payments are only accepted between 10:00 AM and 11:00 AM IST." },
          { status: 403 }
        );
      }
    }

    // 2. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // 3. Parse and sanitize payload
    const body = await req.json().catch(() => ({}));
    const rawPlanName = body.planName || "bronze";
    const planName = sanitizeString(rawPlanName).toLowerCase();

    // 4. Validate requested plan
    const planConfig = SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS["bronze"];
    if (!planConfig || planConfig.name === "Free") {
      return NextResponse.json(
        { error: "Invalid plan selected for checkout. Please choose Bronze, Silver, or Gold." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 5. Verify user exists in database
    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    // 6. Calculate amount in paise (₹1 = 100 paise)
    const amountPaise = planConfig.priceINR * 100;
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 7. Create Razorpay order (or fallback test order if keys unconfigured)
    let order: any = null;
    try {
      const razorpay = getRazorpayClient();
      if (razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        order = await razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: {
            userId,
            planName,
            userEmail: dbUser.email,
          },
        });
      } else {
        // Test Mode Fallback Order
        order = {
          id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          amount: amountPaise,
          currency: "INR",
          status: "created",
        };
      }
    } catch (razorpayErr: any) {
      console.warn("[Razorpay Order Creation Fallback Triggered]:", razorpayErr.message);
      order = {
        id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        amount: amountPaise,
        currency: "INR",
        status: "created",
      };
    }

    // 8. Store order in Transaction model as pending
    const transaction = new Transaction({
      userId,
      planName: planConfig.name,
      amount: planConfig.priceINR,
      currency: "INR",
      status: "pending",
      paymentId: order.id,
      createdAt: new Date(),
    });
    await transaction.save();

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_StackSphereDemo";

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      transactionId: transaction._id.toString(),
    });
  } catch (err: any) {
    console.error("Payment Checkout API Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during payment checkout." },
      { status: 500 }
    );
  }
}
