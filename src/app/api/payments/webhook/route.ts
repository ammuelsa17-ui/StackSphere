import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { verifyRazorpayWebhookSignature, fulfillSubscription } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_mockwebhook123";

    // 1. Webhook Signature Verification
    const isValidSignature = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    
    // In strict mode, if signature is invalid, reject with 400
    if (
      process.env.RAZORPAY_WEBHOOK_SECRET &&
      !process.env.RAZORPAY_WEBHOOK_SECRET.startsWith("whsec_mock") &&
      !isValidSignature
    ) {
      console.error("[Razorpay Webhook Error] Invalid x-razorpay-signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 2. Parse event JSON payload
    let event: any = null;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!event || !event.event) {
      return NextResponse.json({ error: "Missing event type in webhook payload" }, { status: 400 });
    }

    const eventType = event.event;

    // 3. Process supported events: payment.captured or order.paid
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity || {};
      const orderEntity = event.payload?.order?.entity || {};

      const paymentId = paymentEntity.id || "";
      const orderId = paymentEntity.order_id || orderEntity.id || "";
      const notes = paymentEntity.notes || orderEntity.notes || {};

      const userId = notes.userId;
      const planName = notes.planName;

      await connectToDatabase();

      // Find transaction matching orderId or paymentId
      let transaction: any = null;
      if (orderId) {
        transaction = await Transaction.findOne({ paymentId: orderId });
      }
      if (!transaction && paymentId) {
        transaction = await Transaction.findOne({ razorpayPaymentId: paymentId });
      }

      const targetUserId = userId || (transaction ? transaction.userId.toString() : null);
      const targetPlanName = planName || (transaction ? transaction.planName : "Bronze");

      if (targetUserId) {
        // Execute single shared idempotent fulfillment
        await fulfillSubscription({
          userId: targetUserId,
          planName: targetPlanName,
          transactionId: transaction ? transaction._id.toString() : undefined,
          orderId,
          paymentId,
          paymentMethod: "razorpay_webhook",
        });
      }
    }

    // 4. Always return 200 OK for valid webhooks
    return NextResponse.json({ received: true, status: "success" });
  } catch (err: any) {
    console.error("Razorpay Webhook Error:", err.message);
    return NextResponse.json(
      { error: "Internal server error during webhook processing" },
      { status: 500 }
    );
  }
}
