import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  let event: any = null;

  try {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mockwebhook123";

    // Attempt real signature verification if real Stripe configuration is present
    if (
      stripe &&
      signature &&
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock") &&
      !webhookSecret.startsWith("whsec_mock")
    ) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err: any) {
        console.error("Stripe webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // Mock/Test mode payload parsing
      try {
        event = JSON.parse(payload);
      } catch (err) {
        return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
      }
    }

    if (!event || !event.type) {
      return NextResponse.json({ error: "Invalid event data structure" }, { status: 400 });
    }

    // Handle session completion event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;
      const userId = session.client_reference_id || session.metadata?.userId;
      const planName = session.metadata?.planName;

      if (!sessionId) {
        return NextResponse.json({ error: "Session ID missing in event payload" }, { status: 400 });
      }

      await connectToDatabase();

      // 1. Locate and update transaction
      const transaction = await Transaction.findOne({ paymentId: sessionId });
      
      let finalPlanName = planName;
      let finalUserId = userId;

      if (transaction) {
        transaction.status = "success";
        await transaction.save();
        
        finalPlanName = finalPlanName || transaction.planName;
        finalUserId = finalUserId || transaction.userId;
      } else {
        // Create transactional log if webhook arrived before redirect verification
        if (finalUserId && finalPlanName) {
          await Transaction.create({
            userId: finalUserId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || "USD",
            paymentId: sessionId,
            planName: finalPlanName,
            status: "success",
            invoiceUrl: "",
          });
        }
      }

      // 2. Fulfill subscription upgrade on User model
      if (finalUserId && finalPlanName) {
        const user = await User.findById(finalUserId);
        if (user) {
          const startDate = new Date();
          const expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

          user.subscription = {
            plan: finalPlanName,
            paymentStatus: "active",
            startDate,
            expiryDate,
          };
          await user.save();

          // 3. Generate and save PDF Invoice (Day 42: Add automated PDF invoice/receipt generation)
          try {
            const currentTx = transaction || await Transaction.findOne({ paymentId: sessionId });
            if (currentTx) {
              const { generateInvoicePDF, saveInvoicePDF } = require("@/utils/invoice");
              const pdfBuffer = generateInvoicePDF({
                orderId: currentTx._id.toString(),
                date: startDate.toLocaleDateString("en-US"),
                planName: `${currentTx.planName} Plan Subscription`,
                amount: currentTx.amount,
                currency: currentTx.currency || "USD",
                email: user.email,
                name: user.name,
              });

              const invoiceUrl = saveInvoicePDF(currentTx._id.toString(), pdfBuffer);
              currentTx.invoiceUrl = invoiceUrl;
              await currentTx.save();

              // 4. Send purchase receipt email (Day 43: Integrate email delivery for purchase receipts)
              const { sendReceiptEmail } = require("@/utils/email");
              await sendReceiptEmail({
                email: user.email,
                name: user.name,
                planName: currentTx.planName,
                amount: currentTx.amount,
                currency: currentTx.currency || "USD",
                invoicePath: invoiceUrl,
              });
            }
          } catch (pdfErr: any) {
            console.error("Webhook fulfillment processing failed:", pdfErr.message);
          }

          console.log(`[WEBHOOK] Upgraded User ${finalUserId} to ${finalPlanName} subscription successfully.`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred processing webhook." },
      { status: 500 }
    );
  }
}
