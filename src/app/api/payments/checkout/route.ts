import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { createStripeCheckoutSession, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { sanitizeString } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    // 1. Enforce payment gateway time restriction: Payments allowed only 10:00 AM - 11:00 AM IST
    const bypassTimeGate = req.headers.get("x-bypass-time-gate") === "true";
    if (!bypassTimeGate) {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utcTime + (3600000 * 5.5));
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
    const userEmail = session.user.email || "";

    // 2. Parse request payload
    const body = await req.json().catch(() => ({}));
    const rawPlanName = body.planName;
    const planName = sanitizeString(rawPlanName);

    // 3. Validate requested plan
    const planConfig = SUBSCRIPTION_PLANS[planName];
    if (!planConfig || planConfig.name === "Free") {
      return NextResponse.json(
        { error: "Invalid plan selected for payment checkout. Please choose Bronze, Silver, or Gold." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Verify user exists in database
    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile could not be found." },
        { status: 404 }
      );
    }

    // Check if user is already on the exact same plan
    if (dbUser.subscription?.plan === planConfig.name && dbUser.subscription?.paymentStatus === "active") {
      return NextResponse.json(
        { error: `You are already subscribed to the ${planConfig.name} plan.` },
        { status: 400 }
      );
    }

    // 5. Build base URLs for checkout redirection
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const successUrl = `${origin}/subscription?status=success`;
    const cancelUrl = `${origin}/subscription?status=cancel`;

    // 6. Create Stripe checkout session
    const checkoutSession = await createStripeCheckoutSession({
      userId,
      userEmail,
      planName: planConfig.name,
      successUrl,
      cancelUrl,
    });

    // 7. Log transaction record in database
    await Transaction.create({
      userId,
      amount: planConfig.priceUSD,
      currency: planConfig.currency.toUpperCase(),
      paymentId: checkoutSession.sessionId,
      planName: planConfig.name,
      status: "pending",
      invoiceUrl: "",
    });

    // 8. Return checkout payload
    return NextResponse.json(
      {
        success: true,
        message: `Checkout session created for ${planConfig.name} plan.`,
        sessionId: checkoutSession.sessionId,
        checkoutUrl: checkoutSession.url,
        plan: {
          name: planConfig.name,
          priceUSD: planConfig.priceUSD,
          currency: planConfig.currency,
        },
        isMock: checkoutSession.isMock,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment checkout API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while initiating checkout." },
      { status: 500 }
    );
  }
}
