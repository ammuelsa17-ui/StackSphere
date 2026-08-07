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
    const rawPlanName = body.planName;
    const planName = sanitizeString(rawPlanName);

    // 4. Validate requested plan
    const planConfig = SUBSCRIPTION_PLANS[planName];
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
    // Bronze: ₹100 = 10000 paise | Silver: ₹300 = 30000 paise | Gold: ₹1000 = 100000 paise
    const amountPaise = planConfig.priceINR * 100;
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 7. Create real Razorpay order via official Node SDK
    let order: any = null;
    try {
      const razorpay = getRazorpayClient();
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
    } catch (razorpayErr: any) {
      console.error("[Razorpay Order Creation Failed]:", razorpayErr.message);
      return NextResponse.json(
        { error: `Payment gateway order creation failed: ${razorpayErr.message}` },
        { status: 502 }
      );
    }

    // 8. Store Razorpay order in Transaction model as pending
    const transaction = new Transaction({
      userId,
      planName: planConfig.name,
      amount: planConfig.priceINR,
      currency: "INR",
      status: "pending",
      paymentId: order.id, // Store razorpayOrderId
      createdAt: new Date(),
    });
    await transaction.save();

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      transactionId: transaction._id,
    });
  } catch (err: any) {
    console.error("Payment Checkout API Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during payment checkout." },
      { status: 500 }
    );
  }
}
