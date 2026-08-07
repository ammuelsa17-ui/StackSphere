import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import {
  verifyRazorpaySignature,
  getRazorpayClient,
  fulfillSubscription,
} from "@/lib/razorpay";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
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

    const userId = (session.user as any).id;

    // 2. Parse payload
    const body = await req.json().catch(() => ({}));
    const razorpayPaymentId = sanitizeString(body.razorpay_payment_id || body.paymentId);
    const clientOrderId = sanitizeString(body.razorpay_order_id || body.orderId);
    const razorpaySignature = sanitizeString(body.razorpay_signature || body.signature);
    const transactionId = sanitizeString(body.transactionId);

    if (!razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment ID and Razorpay signature are required for verification." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Locate transaction in MongoDB Atlas (Database-stored order is source of truth)
    let transaction: any = null;
    if (transactionId) {
      transaction = await Transaction.findById(transactionId);
    } else if (clientOrderId) {
      transaction = await Transaction.findOne({ paymentId: clientOrderId });
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "No pending transaction log found matching this payment order." },
        { status: 404 }
      );
    }

    // 4. Cross-user order verification check
    if (transaction.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Forbidden access: Transaction belongs to a different user account." },
        { status: 403 }
      );
    }

    // Single-fulfillment check: Return early if already completed
    if (transaction.status === "success" && transaction.isFulfilled) {
      return NextResponse.json({
        success: true,
        alreadyFulfilled: true,
        message: "Payment transaction already verified and fulfilled successfully.",
        plan: transaction.planName,
      });
    }

    // 5. Signature verification using DATABASE-stored order ID (never trust raw client order ID)
    const databaseOrderId = transaction.paymentId; // razorpayOrderId stored at checkout
    const isValidSignature = verifyRazorpaySignature(
      databaseOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      transaction.status = "failed";
      await transaction.save();

      return NextResponse.json(
        { error: "Invalid Razorpay payment signature verification failed." },
        { status: 400 }
      );
    }

    // 6. Verify payment state on Razorpay API (Confirm payment is captured/authorized)
    try {
      const razorpay = getRazorpayClient();
      const paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (!paymentDetails || (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized")) {
        return NextResponse.json(
          { error: `Payment verification failed: Razorpay payment status is '${paymentDetails?.status || "unknown"}'` },
          { status: 400 }
        );
      }
    } catch (razorpayFetchErr: any) {
      console.warn("[Razorpay Payment Fetch Warning]:", razorpayFetchErr.message);
    }

    // 7. Execute single shared idempotent fulfillment
    const fulfillment = await fulfillSubscription({
      userId,
      planName: transaction.planName,
      transactionId: transaction._id.toString(),
      orderId: databaseOrderId,
      paymentId: razorpayPaymentId,
      paymentMethod: "razorpay",
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. Subscription updated.",
      plan: transaction.planName,
      alreadyFulfilled: fulfillment.alreadyFulfilled,
      invoicePath: fulfillment.invoicePath,
    });
  } catch (err: any) {
    console.error("Payment Verification API Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during payment verification." },
      { status: 500 }
    );
  }
}
