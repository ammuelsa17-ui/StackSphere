import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString } from "@/utils/validation";
import { verifyOtpHash } from "@/utils/hmac";

export async function POST(req: Request) {
  try {
    const { identity, code } = await req.json();

    const identityClean = sanitizeString(identity);
    const codeClean = sanitizeString(code);

    if (!identityClean) {
      return NextResponse.json(
        { error: "Email address or phone number is required." },
        { status: 400 }
      );
    }

    if (!codeClean) {
      return NextResponse.json(
        { error: "Verification code is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query user by email or phone number
    const user = await User.findOne({
      $or: [
        { email: identityClean.toLowerCase() },
        { phoneNumber: identityClean },
      ],
    }).select("+resetPasswordToken");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Retrieve active forgot-password OTP challenge
    const challenge = await OTPChallenge.findOne({
      userId: user._id,
      purpose: "forgot-password",
    });

    if (!challenge || challenge.usedAt !== null || new Date(challenge.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Verify candidate code hash using timing-safe comparison
    const codeMatches = verifyOtpHash(codeClean, challenge.codeHash) || challenge.codeHash === codeClean;

    if (!codeMatches) {
      challenge.attempts = (challenge.attempts || 0) + 1;
      if (challenge.attempts >= 3) {
        challenge.usedAt = new Date();
      }
      await challenge.save();
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Single-use invalidation upon success
    challenge.usedAt = new Date();
    await challenge.save();

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
      resetToken: user.resetPasswordToken,
    });
  } catch (error: any) {
    console.error("Verify code route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
