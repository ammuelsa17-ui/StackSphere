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

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email || "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
  return `${name.charAt(0)}***${name.slice(-1)}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length <= 5) return cleaned;
  const prefix = cleaned.slice(0, 3);
  const suffix = cleaned.slice(-4);
  return `${prefix} ******${suffix}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const { targetLanguage } = await req.json();
    const validLanguages = ["en", "es", "hi", "pt", "zh", "fr"];
    if (!targetLanguage || !validLanguages.includes(targetLanguage)) {
      return NextResponse.json({ error: "Invalid target language selection." }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
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

    let destination = "";
    if (channel === "email") {
      destination = (user.email || "").trim();
      if (!destination) {
        return NextResponse.json(
          { error: "No registered email address is available for this account." },
          { status: 400 }
        );
      }
    } else {
      const registeredPhone = (user.phoneNumber || (user as any).phone || "").trim();
      destination = normalizePhone(registeredPhone) || registeredPhone;

      if (!destination) {
        return NextResponse.json(
          { error: "No registered mobile number is available for this account. Please update your phone number in Profile settings." },
          { status: 400 }
        );
      }
    }

    const maskedDestination = channel === "email" ? maskEmail(destination) : maskPhone(destination);

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
      { upsert: true, returnDocument: "after" }
    );

    if (channel === "email") {
      await sendEmail({
        to: destination,
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
        console.log(`[MOCK EMAIL LANGUAGE OTP] Sent code "${rawCode}" to email "${destination}" for target language "${targetLanguage}"`);
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
      destination: maskedDestination,
      resendCooldown: 60,
      message: `Verification code sent via ${channel === "email" ? "email" : "SMS"}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process language OTP request" }, { status: 500 });
  }
}
