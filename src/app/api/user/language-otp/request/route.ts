import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { sendEmail } from "@/utils/email";
import { sendSms } from "@/utils/sms";
import { hashOtp } from "@/utils/hmac";
import { checkOtpRateLimits } from "@/utils/rateLimit";
import { normalizePhone } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetLanguage } = await req.json();
    const validLanguages = ["en", "es", "hi", "pt", "zh", "fr"];
    if (!targetLanguage || !validLanguages.includes(targetLanguage)) {
      return NextResponse.json({ error: "Invalid target language selection" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Account-based hourly rate limit check
    const rateCheck = await checkOtpRateLimits({ userId: userId.toString(), purpose: "language-change" });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
    }

    // Check 60s resend cooldown on existing active challenge
    const existingChallenge = await OTPChallenge.findOne({ userId, purpose: "language-change" });
    if (existingChallenge && existingChallenge.resendAvailableAt) {
      const now = new Date();
      if (new Date(existingChallenge.resendAvailableAt) > now) {
        const secondsRemaining = Math.ceil((new Date(existingChallenge.resendAvailableAt).getTime() - now.getTime()) / 1000);
        return NextResponse.json(
          { error: `Please wait ${secondsRemaining} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Determine verification channel based on target language rule
    // French -> Email OTP; English, Spanish, Hindi, Portuguese, Chinese -> Mobile SMS OTP
    const channel = targetLanguage === "fr" ? "email" : "sms";
    const destination = channel === "email" ? user.email : (normalizePhone(user.phoneNumber) || user.phoneNumber || "+15551234567");

    // Generate 6-digit OTP code and HMAC-SHA256 hash
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = hashOtp(rawCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
    const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

    await OTPChallenge.findOneAndUpdate(
      { userId, purpose: "language-change" },
      {
        channel,
        destination,
        codeHash,
        pendingLanguage: targetLanguage,
        expiresAt,
        resendAvailableAt,
        attempts: 0,
        usedAt: null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (channel === "email") {
      await sendEmail({
        to: user.email,
        subject: "StackSphere Language Change Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
            <h2 style="color: #4f46e5;">Verification Request</h2>
            <p>You requested to change your account language preference to French. Your 6-digit OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f3f4f6; padding: 12px; text-align: center; border-radius: 8px; letter-spacing: 4px;">
              ${rawCode}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This code expires in 5 minutes and is valid for a single use.</p>
          </div>
        `,
      });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[MOCK EMAIL LANGUAGE OTP] Sent code "${rawCode}" to email "${user.email}" for target language "${targetLanguage}"`);
      }
    } else {
      await sendSms({
        to: destination,
        message: `Your StackSphere language verification code is: ${rawCode}. Valid for 5 minutes.`,
      });
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[MOCK SMS LANGUAGE OTP] Sent code "${rawCode}" via SMS to phone "${destination}" for target language "${targetLanguage}"`
        );
      }
    }

    return NextResponse.json({
      success: true,
      channel,
      resendCooldown: 60,
      message: `Verification code sent via ${channel === "email" ? "email" : "SMS"}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process language OTP request" }, { status: 500 });
  }
}
