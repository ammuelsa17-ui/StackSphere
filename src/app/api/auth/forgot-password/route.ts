export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString, validateEmail, normalizePhone } from "@/utils/validation";
import { sendEmail } from "@/utils/email";
import { sendTwilioVerifyOtp } from "@/utils/sms";
import { hashOtp } from "@/utils/hmac";
import { checkOtpRateLimits } from "@/utils/rateLimit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phoneNumber, phone } = body;

    const emailClean = sanitizeString(email);
    const phoneClean = sanitizeString(phoneNumber || phone);

    const emailProvided = emailClean !== "";
    const phoneProvided = phoneClean !== "";

    if (!emailProvided && !phoneProvided) {
      return NextResponse.json(
        {
          success: false,
          error: "Either email address or phone number is required.",
          message: "Either email address or phone number is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let user;
    if (emailProvided) {
      if (!validateEmail(emailClean)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please provide a valid email address.",
            message: "Please provide a valid email address.",
          },
          { status: 400 }
        );
      }
      user = await User.findOne({ email: emailClean.toLowerCase() }).select(
        "+resetPasswordToken +resetPasswordExpires +lastForgotPasswordRequestedAt"
      );
    } else {
      const normalizedPhone = normalizePhone(phoneClean);
      if (!normalizedPhone) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter a valid phone number.",
            message: "Please enter a valid phone number.",
          },
          { status: 400 }
        );
      }
      user = await User.findOne({
        $or: [
          { phoneNumber: normalizedPhone },
          { phoneNumber: phoneClean },
        ],
      }).select(
        "+resetPasswordToken +resetPasswordExpires +lastForgotPasswordRequestedAt"
      );
    }

    // 2. User Not Found handling
    if (!user) {
      if (!emailProvided) {
        return NextResponse.json(
          {
            success: false,
            error: "We couldn't start phone recovery for this account. Check the number or use email recovery.",
            message: "We couldn't start phone recovery for this account. Check the number or use email recovery.",
          },
          { status: 400 }
        );
      }

      // Account enumeration mitigation for email
      return NextResponse.json(
        {
          success: true,
          message: "If an account matching the details exists, a verification code has been dispatched.",
        },
        { status: 200 }
      );
    }

    // Rate-limit check
    const rateCheck = await checkOtpRateLimits({ userId: user._id.toString(), purpose: "forgot-password" });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason,
          message: rateCheck.reason,
        },
        { status: 429 }
      );
    }

    // Rate-limit: allow only 1 request per calendar day (IST)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    const startOfIstTodayUtc = new Date(
      Date.UTC(istTime.getFullYear(), istTime.getMonth(), istTime.getDate()) - (3600000 * 5.5)
    );

    if (
      user.lastForgotPasswordRequestedAt &&
      new Date(user.lastForgotPasswordRequestedAt) >= startOfIstTodayUtc
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You can use this option only one time per day.",
          message: "You can use this option only one time per day.",
        },
        { status: 429 }
      );
    }

    // Generate secure recovery token (32 bytes) for password reset step
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const channel = emailProvided ? "email" : "sms";

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    user.lastForgotPasswordRequestedAt = now;
    await user.save();

    if (channel === "email") {
      // Generate 6-digit verification code for Email recovery
      const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = hashOtp(rawCode);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
      const resendAvailableAt = new Date(Date.now() + 60 * 1000);

      await OTPChallenge.findOneAndUpdate(
        { userId: user._id, purpose: "forgot-password" },
        {
          channel: "email",
          destination: user.email,
          codeHash,
          expiresAt,
          resendAvailableAt,
          attempts: 0,
          usedAt: null,
        },
        { upsert: true, returnDocument: 'after' }
      );

      await sendEmail({
        to: user.email,
        subject: "StackSphere Password Reset Recovery Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
            <h2 style="color: #4f46e5;">Password Recovery Code</h2>
            <p>Your 6-digit password reset verification code is:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f3f4f6; padding: 12px; text-align: center; border-radius: 8px; letter-spacing: 4px;">
              ${rawCode}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">This code expires in 5 minutes and is valid for a single use.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Verification code has been successfully dispatched to your email.",
        method: "email",
        token,
      });
    } else {
      // Dispatch SMS OTP via Twilio Verify API v2 Service
      const targetPhone = normalizePhone(phoneClean) || phoneClean;
      const verifyRes = await sendTwilioVerifyOtp(targetPhone);

      if (!verifyRes.success) {
        let userMsg = "We couldn't send the verification code via SMS right now. Please try email recovery or try again later.";
        if (verifyRes.errorCode === "MISSING_VERIFY_SERVICE") {
          userMsg = "TWILIO VERIFY CONFIGURATION MISSING: TWILIO_VERIFY_SERVICE_SID environment variable is missing on Vercel environment.";
        }

        return NextResponse.json(
          {
            success: false,
            error: userMsg,
            message: userMsg,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent via Twilio Verify SMS.",
        method: "sms",
        token,
      });
    }
  } catch (error: any) {
    console.error("Forgot password route error occurred.");
    const msg = error?.message || "An unexpected error occurred while processing recovery request.";
    return NextResponse.json(
      {
        success: false,
        error: msg,
        message: msg,
      },
      { status: 500 }
    );
  }
}
