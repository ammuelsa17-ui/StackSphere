import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString, normalizePhone } from "@/utils/validation";
import { sendSms } from "@/utils/sms";
import { hashOtp } from "@/utils/hmac";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber } = body;

    const phoneClean = sanitizeString(phoneNumber);
    if (!phoneClean) {
      return NextResponse.json(
        { error: "Phone number is required." },
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

    // 1. Check if phone number is already registered in MongoDB
    const existingPhoneUser = await User.findOne({
      $or: [
        { phoneNumber: normalizedPhone },
        { phoneNumber: phoneClean },
      ],
    });

    if (existingPhoneUser) {
      return NextResponse.json(
        { error: "This phone number is already registered. Use a different number or sign in." },
        { status: 400 }
      );
    }

    // 2. Generate 6-digit cryptographically secure OTP
    const rawCode = randomInt(100000, 1000000).toString();
    const codeHash = hashOtp(rawCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry
    const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

    // 3. Upsert registration OTP challenge in MongoDB
    await OTPChallenge.findOneAndUpdate(
      { destination: normalizedPhone, purpose: "registration" },
      {
        channel: "sms",
        destination: normalizedPhone,
        codeHash,
        expiresAt,
        resendAvailableAt,
        attempts: 0,
        verified: false,
        verifiedAt: null,
        usedAt: null,
      },
      { upsert: true, returnDocument: "after" }
    );

    // 4. Dispatch SMS via Twilio
    const smsResult = await sendSms({
      to: normalizedPhone,
      message: `Your StackSphere registration verification code is: ${rawCode}. Valid for 5 minutes.`,
    });

    if (!smsResult.success) {
      const errMsg = smsResult.errorMessage || "Twilio SMS dispatch failed.";
      return NextResponse.json(
        {
          error: `TWILIO DISPATCH ERROR (${smsResult.errorCode || 'API'}): ${errMsg}`,
          twilioError: true,
          details: smsResult,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via SMS to ${normalizedPhone}.`,
    });
  } catch (error: any) {
    console.error("Send phone OTP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the verification code." },
      { status: 500 }
    );
  }
}
