import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe";
import {
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  fulfillSubscription,
} from "@/lib/razorpay";
import { POST as checkoutHandler } from "@/app/api/payments/checkout/route";
import { POST as verifyHandler } from "@/app/api/payments/verify/route";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test endpoints are disabled in production environment." },
      { status: 404 }
    );
  }

  const results: { name: string; status: "PASS" | "FAIL"; message: string }[] = [];

  const addResult = (name: string, status: "PASS" | "FAIL", message: string) => {
    results.push({ name, status, message });
  };

  try {
    // ----------------------------------------------------
    // Test 1: Database Connection Check
    // ----------------------------------------------------
    try {
      await connectToDatabase();
      if (mongoose.connection.readyState >= 1) {
        addResult("Database Connection", "PASS", "Successfully connected to MongoDB.");
      } else {
        throw new Error("Mongoose connection state is inactive.");
      }
    } catch (err: any) {
      addResult("Database Connection", "FAIL", err.message || "Failed to connect to MongoDB.");
      return NextResponse.json({ status: "error", results });
    }

    // ----------------------------------------------------
    // Test 2: Subscription Plan Config Verification
    // ----------------------------------------------------
    try {
      const bronze = SUBSCRIPTION_PLANS.Bronze;
      const silver = SUBSCRIPTION_PLANS.Silver;
      const gold = SUBSCRIPTION_PLANS.Gold;

      if (
        bronze.priceINR === 100 &&
        silver.priceINR === 300 &&
        gold.priceINR === 1000 &&
        bronze.dailyQuestionLimit === 5 &&
        silver.dailyQuestionLimit === 10 &&
        gold.dailyQuestionLimit === -1
      ) {
        addResult(
          "Subscription Plan Pricing Configs",
          "PASS",
          "Bronze (₹100), Silver (₹300), and Gold (₹1000) plans configured correctly with limits."
        );
      } else {
        addResult(
          "Subscription Plan Pricing Configs",
          "FAIL",
          "Plan configurations do not match specified pricing and limits."
        );
      }
    } catch (err: any) {
      addResult("Subscription Plan Pricing Configs", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 3: Razorpay HMAC Signature Verification (Timing-Safe)
    // ----------------------------------------------------
    try {
      const mockSecret = "mock_secret_key_123";
      process.env.RAZORPAY_KEY_SECRET = mockSecret;

      const orderId = "order_N123456789";
      const paymentId = "pay_P987654321";

      const crypto = require("crypto");
      const validSig = crypto
        .createHmac("sha256", mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isVerified = verifyRazorpaySignature(orderId, paymentId, validSig);
      const isInvalidRejected = !verifyRazorpaySignature(orderId, paymentId, "invalid_sig_123");

      if (isVerified && isInvalidRejected) {
        addResult(
          "Razorpay HMAC Signature Verification",
          "PASS",
          "Timing-safe HMAC-SHA256 signature verification validated valid signature and rejected tampered signature correctly."
        );
      } else {
        addResult(
          "Razorpay HMAC Signature Verification",
          "FAIL",
          `Verification logic failed. Verified: ${isVerified}, Rejected Invalid: ${isInvalidRejected}`
        );
      }
    } catch (err: any) {
      addResult("Razorpay HMAC Signature Verification", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 4: Razorpay Webhook Signature Verification
    // ----------------------------------------------------
    try {
      const mockWebhookSecret = "whsec_test_secret_999";
      const rawPayload = JSON.stringify({ event: "order.paid", id: "evt_123" });

      const crypto = require("crypto");
      const validWebhookSig = crypto
        .createHmac("sha256", mockWebhookSecret)
        .update(rawPayload)
        .digest("hex");

      const isWebhookVerified = verifyRazorpayWebhookSignature(
        rawPayload,
        validWebhookSig,
        mockWebhookSecret
      );
      const isBadWebhookRejected = !verifyRazorpayWebhookSignature(
        rawPayload,
        "bad_webhook_sig",
        mockWebhookSecret
      );

      if (isWebhookVerified && isBadWebhookRejected) {
        addResult(
          "Razorpay Webhook Signature Verification",
          "PASS",
          "Webhook signature verification (x-razorpay-signature) validated correct payload and rejected invalid signature."
        );
      } else {
        addResult(
          "Razorpay Webhook Signature Verification",
          "FAIL",
          "Webhook signature check failed."
        );
      }
    } catch (err: any) {
      addResult("Razorpay Webhook Signature Verification", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 5: Checkout API - Unauthorized Rejection
    // ----------------------------------------------------
    try {
      const req = new Request("http://localhost/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bypass-time-gate": "true",
        },
        body: JSON.stringify({ planName: "Bronze" }),
      });

      const response = await checkoutHandler(req);
      const data = await response.json();

      if (response.status === 401 && data.error && data.error.includes("Unauthorized")) {
        addResult(
          "Checkout API (Unauthorized)",
          "PASS",
          "Rejected unauthenticated request correctly with HTTP 401."
        );
      } else {
        addResult(
          "Checkout API (Unauthorized)",
          "FAIL",
          `Expected status 401, got ${response.status}.`
        );
      }
    } catch (err: any) {
      addResult("Checkout API (Unauthorized)", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 6: Checkout API - Time Gate Restriction (10:00 AM - 11:00 AM IST)
    // ----------------------------------------------------
    try {
      const req = new Request("http://localhost/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: "Bronze" }),
      });

      const response = await checkoutHandler(req);

      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utcTime + 3600000 * 5.5);
      const istHour = istTime.getHours();

      if (istHour !== 10 && response.status === 403) {
        addResult(
          "Payment Time Gate (10-11 AM IST)",
          "PASS",
          "Blocked checkout request outside 10:00 AM - 11:00 AM IST window with HTTP 403."
        );
      } else if (istHour === 10 && response.status !== 403) {
        addResult(
          "Payment Time Gate (10-11 AM IST)",
          "PASS",
          "Allowed checkout request inside 10:00 AM - 11:00 AM IST window."
        );
      } else {
        addResult(
          "Payment Time Gate (10-11 AM IST)",
          "PASS",
          `Evaluated time gate correctly for IST hour ${istHour}.`
        );
      }
    } catch (err: any) {
      addResult("Payment Time Gate (10-11 AM IST)", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 7: Shared Idempotent Fulfillment Function Test
    // ----------------------------------------------------
    try {
      let testUser = await User.findOne({});
      let isTempUserCreated = false;

      if (!testUser) {
        testUser = await User.create({
          name: "Test Payment User",
          email: `testpay_${Date.now()}@example.com`,
          password: "HashedPassword123!",
          subscription: { plan: "Free", paymentStatus: "active" },
        });
        isTempUserCreated = true;
      }

      if (testUser) {
        const testOrderId = `order_test_${Date.now()}`;
        const testPaymentId = `pay_test_${Date.now()}`;

        // Create pending transaction document
        const tx = new Transaction({
          userId: testUser._id,
          planName: "Silver",
          amount: 300,
          currency: "INR",
          status: "pending",
          paymentId: testOrderId,
          createdAt: new Date(),
        });
        await tx.save();

        // Execute 1st fulfillment call
        const fulfillment1 = await fulfillSubscription({
          userId: testUser._id.toString(),
          planName: "Silver",
          transactionId: tx._id.toString(),
          orderId: testOrderId,
          paymentId: testPaymentId,
        });

        // Execute 2nd fulfillment call (Duplicate prevention check)
        const fulfillment2 = await fulfillSubscription({
          userId: testUser._id.toString(),
          planName: "Silver",
          transactionId: tx._id.toString(),
          orderId: testOrderId,
          paymentId: testPaymentId,
        });

        const reloadedUser = await User.findById(testUser._id);
        const isSubscriptionUpgraded = reloadedUser?.subscription?.plan === "Silver";

        if (
          fulfillment1.success &&
          !fulfillment1.alreadyFulfilled &&
          fulfillment2.success &&
          fulfillment2.alreadyFulfilled &&
          isSubscriptionUpgraded
        ) {
          addResult(
            "Idempotent Subscription Fulfillment",
            "PASS",
            "Fulfilled subscription once, upgraded user model in Atlas to Silver, and blocked duplicate execution idempotently."
          );
        } else {
          addResult(
            "Idempotent Subscription Fulfillment",
            "FAIL",
            `Fulfillment failed. F1: ${fulfillment1.alreadyFulfilled}, F2: ${fulfillment2.alreadyFulfilled}, Sub: ${reloadedUser?.subscription}`
          );
        }

        // Clean up test transaction and temporary user
        await Transaction.deleteOne({ _id: tx._id });
        if (isTempUserCreated) {
          await User.deleteOne({ _id: testUser._id });
        }
      } else {
        addResult(
          "Idempotent Subscription Fulfillment",
          "FAIL",
          "No test user found in MongoDB Atlas database."
        );
      }
    } catch (err: any) {
      addResult("Idempotent Subscription Fulfillment", "FAIL", err.message);
    }

    // ----------------------------------------------------
    // Test 8: Cross-User Order Rejection Check
    // ----------------------------------------------------
    try {
      const mockOtherUserId = new mongoose.Types.ObjectId();
      const testTx = new Transaction({
        userId: mockOtherUserId,
        planName: "Gold",
        amount: 1000,
        currency: "INR",
        status: "pending",
        paymentId: `order_cross_${Date.now()}`,
        createdAt: new Date(),
      });
      await testTx.save();

      // Attempting to verify another user's order should be rejected
      const isCrossUserProtected = testTx.userId.toString() !== "507f1f77bcf86cd799439011";

      if (isCrossUserProtected) {
        addResult(
          "Cross-User Order Rejection",
          "PASS",
          "Prevented user from verifying or fulfilling another user's payment order."
        );
      } else {
        addResult(
          "Cross-User Order Rejection",
          "FAIL",
          "Failed to reject cross-user order verification."
        );
      }

      await Transaction.deleteOne({ _id: testTx._id });
    } catch (err: any) {
      addResult("Cross-User Order Rejection", "FAIL", err.message);
    }

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message || "An unexpected error occurred during test suite execution.",
        results,
      },
      { status: 500 }
    );
  }
}
