import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString, validateEmail, normalizePhone } from "@/utils/validation";
import { verifyOtpHash } from "@/utils/hmac";
import { checkTwilioVerifyOtp } from "@/utils/sms";

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

    const isEmail = validateEmail(identityClean);
    let user;

    if (isEmail) {
      user = await User.findOne({ email: identityClean.toLowerCase() }).select("+resetPasswordToken");
    } else {
      const normalizedPhone = normalizePhone(identityClean) || identityClean;
      user = await User.findOne({
        $or: [
          { phoneNumber: normalizedPhone },
          { phoneNumber: identityClean },
        ],
      }).select("+resetPasswordToken");
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    if (!isEmail) {
      // Verification via Twilio Verify API v2 service for SMS OTP
      const normalizedPhone = normalizePhone(identityClean) || identityClean;
      const verifyCheck = await checkTwilioVerifyOtp(normalizedPhone, codeClean);

      if (!verifyCheck.approved) {
        return NextResponse.json(
          { error: "Invalid or expired verification code." },
          { status: 400 }
        );
      }
    } else {
      // Verification via OTPChallenge database record for Email OTP
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

      challenge.usedAt = new Date();
      await challenge.save();
    }

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
      resetToken: user.resetPasswordToken,
    });
  } catch (error: any) {
    console.error("Verify code route error occurred.");
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
