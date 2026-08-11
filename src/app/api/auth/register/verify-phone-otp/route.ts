import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString, normalizePhone } from "@/utils/validation";
import { verifyOtpHash } from "@/utils/hmac";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, code } = body;

    const phoneClean = sanitizeString(phoneNumber);
    const codeClean = sanitizeString(code).trim();

    if (!phoneClean || !codeClean) {
      return NextResponse.json(
        { error: "Phone number and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    if (codeClean.length !== 6 || !/^\d{6}$/.test(codeClean)) {
      return NextResponse.json(
        { error: "Verification code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phoneClean);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Retrieve active registration OTP challenge
    const challenge = await OTPChallenge.findOne({
      destination: normalizedPhone,
      purpose: "registration",
    });

    if (
      !challenge ||
      challenge.usedAt !== null ||
      new Date(challenge.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // 2. Verify code hash using timing-safe comparison
    const isCodeValid = verifyOtpHash(codeClean, challenge.codeHash) || challenge.codeHash === codeClean;

    if (!isCodeValid) {
      challenge.attempts = (challenge.attempts || 0) + 1;
      if (challenge.attempts >= 3) {
        challenge.usedAt = new Date();
      }
      await challenge.save();

      const remaining = Math.max(0, 3 - challenge.attempts);
      return NextResponse.json(
        { error: `Invalid verification code.${remaining > 0 ? ` (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)` : " Challenge locked due to maximum failed attempts."}` },
        { status: 400 }
      );
    }

    // 3. Mark challenge as verified
    challenge.verified = true;
    challenge.verifiedAt = new Date();
    await challenge.save();

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error: any) {
    console.error("Verify phone OTP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
