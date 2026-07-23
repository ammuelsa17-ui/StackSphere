import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { verifyStripeCheckoutSession } from "@/lib/stripe";
import { sanitizeString } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const body = await req.json().catch(() => ({}));
    const rawSessionId = body.sessionId;
    const sessionId = sanitizeString(rawSessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required for verification." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Find matching transaction log
    const transaction = await Transaction.findOne({ paymentId: sessionId });
    if (!transaction) {
      return NextResponse.json(
        { error: "No transaction found matching this payment session." },
        { status: 404 }
      );
    }

    // Return success early if already processed
    if (transaction.status === "success") {
      return NextResponse.json({
        success: true,
        message: "Payment transaction already verified and fulfilled successfully.",
        plan: transaction.planName,
      });
    }

    // 4. Verify checkout session via Stripe API helper
    const verification = await verifyStripeCheckoutSession(sessionId);

    if (!verification.success) {
      // Mark transaction status as failed if payment was not successfully completed
      transaction.status = "failed";
      await transaction.save();

      return NextResponse.json(
        { error: "Payment verification failed. Session is not completed or paid." },
        { status: 400 }
      );
    }

    // 5. Update transaction status to success
    transaction.status = "success";
    await transaction.save();

    // 6. Update user subscription status (Day 40: Manage active subscription states on User model)
    const user = await User.findById(transaction.userId);
    if (!user) {
      return NextResponse.json(
        { error: "Associated user profile could not be found." },
        { status: 404 }
      );
    }

    // Set 30 days subscription duration
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    user.subscription = {
      plan: transaction.planName,
      paymentStatus: "active",
      startDate,
      expiryDate,
    };

    await user.save();

    // 7. Generate and save PDF Invoice (Day 42: Add automated PDF invoice/receipt generation)
    try {
      const { generateInvoicePDF, saveInvoicePDF } = require("@/utils/invoice");
      const pdfBuffer = generateInvoicePDF({
        orderId: transaction._id.toString(),
        date: startDate.toLocaleDateString("en-US"),
        planName: `${transaction.planName} Plan Subscription`,
        amount: transaction.amount,
        currency: transaction.currency || "USD",
        email: user.email,
        name: user.name,
      });

      const invoiceUrl = saveInvoicePDF(transaction._id.toString(), pdfBuffer);
      transaction.invoiceUrl = invoiceUrl;
      await transaction.save();
    } catch (pdfErr: any) {
      console.error("PDF Invoice generation failed:", pdfErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Payment successfully verified. Upgraded to ${transaction.planName} plan.`,
      plan: transaction.planName,
      expiryDate: expiryDate.toISOString(),
      invoiceUrl: transaction.invoiceUrl,
    });
  } catch (error: any) {
    console.error("Payment verification API error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during payment verification." },
      { status: 500 }
    );
  }
}
