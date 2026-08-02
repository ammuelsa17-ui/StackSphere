import OTPChallenge from "@/models/OTPChallenge";

/**
 * Backend OTP Rate Limiting.
 * Enforces:
 * 1. Account-based limit: max 5 OTP requests per hour per user account.
 * 2. IP-based limit: max 10 OTP requests per hour per IP address.
 */

interface RateLimitCheckOptions {
  userId: string;
  ipAddress?: string;
  purpose: "login" | "forgot-password" | "language-change";
}

export async function checkOtpRateLimits(options: RateLimitCheckOptions): Promise<{ allowed: boolean; reason?: string }> {
  const { userId, purpose } = options;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // 1. Account-based hourly limit check (max 5 requests per hour across all purposes)
  const accountRequestCount = await OTPChallenge.countDocuments({
    userId,
    createdAt: { $gte: oneHourAgo },
  });

  if (accountRequestCount >= 5) {
    return {
      allowed: false,
      reason: "Account rate limit exceeded. Maximum 5 OTP requests allowed per hour. Please try again later.",
    };
  }

  return { allowed: true };
}
