import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { generateInvoicePDF, saveInvoicePDF } from "@/utils/invoice";
import { sendReceiptEmail } from "@/utils/email";

// Initialize Razorpay SDK instance lazily to avoid build errors if keys are missing
let razorpayInstance: any = null;

export function getRazorpayClient() {
  if (!razorpayInstance) {
    const RazorpayModule = require("razorpay");
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing.");
    }

    razorpayInstance = new RazorpayModule({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
}

/**
 * Verify Razorpay payment signature using timing-safe comparison.
 * Signature formula: HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const genBuffer = Buffer.from(generatedSignature, "hex");
    if (sigBuffer.length !== genBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, genBuffer);
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay webhook signature using timing-safe comparison.
 * Signature header: x-razorpay-signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !rawBody || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expectedSignature, "hex");
    if (sigBuffer.length !== expBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch {
    return false;
  }
}

export interface FulfillmentOptions {
  userId: string;
  planName: "Bronze" | "Silver" | "Gold";
  transactionId?: string; // MongoDB _id
  orderId?: string; // Razorpay orderId
  paymentId: string; // Razorpay paymentId
  paymentMethod?: string;
}

/**
 * Single Shared Idempotent Fulfillment Function
 * Used by both /api/payments/verify and /api/payments/webhook
 */
export async function fulfillSubscription(options: FulfillmentOptions) {
  const { userId, planName, transactionId, orderId, paymentId, paymentMethod } = options;

  await connectToDatabase();

  // Locate transaction log
  let transaction: any = null;
  if (transactionId) {
    transaction = await Transaction.findById(transactionId);
  } else if (orderId) {
    transaction = await Transaction.findOne({ paymentId: orderId });
  }

  if (!transaction) {
    // Create completed transaction log if not existing
    const planConfig = SUBSCRIPTION_PLANS[planName];
    transaction = new Transaction({
      userId,
      planName,
      amount: planConfig ? planConfig.priceINR : 100,
      currency: "INR",
      status: "success",
      paymentId: paymentId || orderId || `pay_${Date.now()}`,
      completedAt: new Date(),
    });
    await transaction.save();
  }

  // Idempotency safety check: Return early if transaction is already success
  if (transaction.status === "success") {
    return {
      success: true,
      alreadyFulfilled: true,
      transaction,
    };
  }

  // Atomically mark transaction completed & fulfilled
  transaction.status = "success";
  transaction.isFulfilled = true;
  transaction.razorpayPaymentId = paymentId;
  transaction.completedAt = new Date();
  await transaction.save();

  // Find user and upgrade subscription
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`Fulfillment failed: User document not found for ID ${userId}`);
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active

  user.subscription = {
    plan: planName,
    paymentStatus: "active",
    startDate: now,
    expiryDate: endDate,
  };
  await user.save();

  // Generate PDF Invoice and save to disk/storage
  const planConfig = SUBSCRIPTION_PLANS[planName];
  const pdfBuffer = generateInvoicePDF({
    orderId: transaction.paymentId || orderId || paymentId,
    date: now.toLocaleDateString(),
    planName,
    amount: transaction.amount || (planConfig ? planConfig.priceINR : 100),
    currency: "INR",
    email: user.email,
    name: user.name || "Subscriber",
  });

  const invoicePath = saveInvoicePDF(transaction.paymentId || orderId || paymentId, pdfBuffer);

  // Dispatch receipt email via SMTP (fails silently if SMTP unconfigured)
  try {
    await sendReceiptEmail({
      email: user.email,
      name: user.name || "Subscriber",
      planName,
      amount: transaction.amount || (planConfig ? planConfig.priceINR : 100),
      currency: "INR",
      invoicePath,
    });
  } catch (emailErr: any) {
    console.warn("[Fulfillment Email Warn] Could not send receipt email:", emailErr.message);
  }

  return {
    success: true,
    alreadyFulfilled: false,
    transaction,
    user,
    invoicePath,
  };
}
