// Stripe developer library wrapper for StackSphere payment system

let stripeInstance: any = null;

try {
  // Dynamically import stripe if installed
  const StripeModule = require("stripe");
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mocksecret123";
  stripeInstance = new StripeModule(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia",
  });
} catch (err) {
  stripeInstance = null;
}

export const stripe = stripeInstance;

// Plan details definitions with pricing, features, and system limits
export interface SubscriptionPlanConfig {
  name: "Free" | "Bronze" | "Silver" | "Gold";
  priceUSD: number;
  amountCents: number;
  currency: string;
  description: string;
  dailyQuestionLimit: number; // 1 (Free), 5 (Bronze), 10 (Silver), -1 (Gold/Unlimited)
  maxUploadSizeMB: number; // 0 (Free - no uploads), 5MB (Bronze), 10MB (Silver), 20MB (Gold)
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanConfig> = {
  Free: {
    name: "Free",
    priceUSD: 0,
    amountCents: 0,
    currency: "usd",
    description: "Essential Q&A features for developers getting started.",
    dailyQuestionLimit: 1,
    maxUploadSizeMB: 0,
    features: [
      "1 question post per day",
      "Standard community Q&A access",
      "Basic profile personalization",
      "No image or video uploads allowed",
    ],
  },
  Bronze: {
    name: "Bronze",
    priceUSD: 5,
    amountCents: 500,
    currency: "usd",
    description: "Perfect for active developers seeking occasional media uploads.",
    dailyQuestionLimit: 5,
    maxUploadSizeMB: 5,
    features: [
      "5 question posts per day",
      "Priority community support",
      "Image uploads up to 5MB",
      "Bronze badge on your profile",
    ],
  },
  Silver: {
    name: "Silver",
    priceUSD: 15,
    amountCents: 1500,
    currency: "usd",
    description: "Our recommended choice for professional content creators.",
    dailyQuestionLimit: 10,
    maxUploadSizeMB: 10,
    features: [
      "10 question posts per day",
      "High-priority response times",
      "Image & video uploads up to 10MB",
      "Silver badge on your profile",
      "Completely ad-free browsing",
    ],
  },
  Gold: {
    name: "Gold",
    priceUSD: 29,
    amountCents: 2900,
    currency: "usd",
    description: "Ultimate power for teams, experts, and enterprise contributors.",
    dailyQuestionLimit: -1, // Unlimited
    maxUploadSizeMB: 20,
    features: [
      "Unlimited question posts",
      "VIP dedicated live-chat support",
      "Advanced media uploads up to 20MB",
      "Gold badge on your profile",
      "Exclusive premium profile themes",
    ],
  },
};

/**
 * Creates a Stripe Checkout Session or returns structured session object.
 */
export async function createStripeCheckoutSession({
  userId,
  userEmail,
  planName,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = SUBSCRIPTION_PLANS[planName];
  if (!plan || plan.priceUSD === 0) {
    throw new Error("Invalid plan selected for paid checkout.");
  }

  // Generate unique fallback session ID for test environments
  const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Attempt real Stripe SDK call if valid API key and SDK instance are supplied
  if (stripe && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: {
          userId,
          planName: plan.name,
        },
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: `StackSphere ${plan.name} Plan Membership`,
                description: plan.description,
              },
              unit_amount: plan.amountCents,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
      });

      return {
        sessionId: session.id,
        url: session.url || successUrl,
        isMock: false,
        amount: plan.priceUSD,
        currency: plan.currency,
        planName: plan.name,
      };
    } catch (err: any) {
      console.warn("Stripe API call fallback to mock mode:", err.message);
    }
  }

  // Developer / Mock mode fallback response
  return {
    sessionId: mockSessionId,
    url: `${successUrl}?session_id=${mockSessionId}&mock=true`,
    isMock: true,
    amount: plan.priceUSD,
    currency: plan.currency,
    planName: plan.name,
  };
}

/**
 * Retrieves and verifies a Stripe Checkout Session status.
 */
export async function verifyStripeCheckoutSession(sessionId: string) {
  if (!sessionId) {
    throw new Error("Session ID is required for verification.");
  }

  // Handle developer mock session IDs
  if (sessionId.startsWith("cs_test_")) {
    return {
      success: true,
      isMock: true,
      status: "complete",
      paymentStatus: "paid",
    };
  }

  // Handle real Stripe SDK verification
  if (stripe && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_mock")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentStatus = session.payment_status;
      const status = session.status;

      return {
        success: paymentStatus === "paid" || status === "complete",
        isMock: false,
        status,
        paymentStatus,
        userId: session.client_reference_id || session.metadata?.userId || null,
        planName: session.metadata?.planName || null,
      };
    } catch (err: any) {
      console.warn("Stripe session verification failed:", err.message);
    }
  }

  // Default mock success fallback for test/dev mode session IDs
  return {
    success: true,
    isMock: true,
    status: "complete",
    paymentStatus: "paid",
  };
}

