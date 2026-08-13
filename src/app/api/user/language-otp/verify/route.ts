import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { verifyOtpHash } from "@/utils/hmac";
import { checkTwilioVerifyOtp } from "@/utils/sms";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter the 6-digit verification code" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const challenge = await OTPChallenge.findOne({ userId, purpose: "language-change" });

    if (!challenge || challenge.usedAt !== null) {
      return NextResponse.json({ error: "No active verification request found. Please request a new code." }, { status: 400 });
    }

    // Check code expiry
    if (new Date(challenge.expiresAt) < new Date()) {
      challenge.usedAt = new Date();
      await challenge.save();
      return NextResponse.json({ error: "Verification code has expired. Please request a new code." }, { status: 400 });
    }

    // Verify candidate code hash using timing-safe comparison or Twilio Verify
    const candidateStr = code.trim();
    let codeMatches = verifyOtpHash(candidateStr, challenge.codeHash) || challenge.codeHash === candidateStr;

    if (!codeMatches && challenge.channel === "sms" && process.env.TWILIO_VERIFY_SERVICE_SID) {
      const verifyResult = await checkTwilioVerifyOtp(challenge.destination, candidateStr);
      if (verifyResult.approved) {
        codeMatches = true;
      }
    }

    if (!codeMatches) {
      challenge.attempts = (challenge.attempts || 0) + 1;
      if (challenge.attempts >= 3) {
        challenge.usedAt = new Date();
        await challenge.save();
        return NextResponse.json(
          { error: "Maximum verification attempts exceeded. Your request has been cancelled." },
          { status: 429 }
        );
      }
      await challenge.save();
      return NextResponse.json(
        { error: `Invalid verification code. ${3 - challenge.attempts} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // Single-use verification success: update preferredLanguage in User profile
    const newLanguage = challenge.pendingLanguage || "en";
    await User.findByIdAndUpdate(userId, { preferredLanguage: newLanguage });

    challenge.usedAt = new Date();
    await challenge.save();

    return NextResponse.json({
      success: true,
      language: newLanguage,
      message: `Language successfully updated to ${newLanguage.toUpperCase()}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify language OTP code" }, { status: 500 });
  }
}
