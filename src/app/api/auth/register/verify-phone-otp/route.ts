import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import OTPChallenge from "@/models/OTPChallenge";
import { sanitizeString, normalizePhone } from "@/utils/validation";
import { checkTwilioVerifyOtp } from "@/utils/sms";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, code } = body;

    const phoneClean = sanitizeString(phoneNumber);
    const codeClean = sanitizeString(code).trim();

    if (!phoneClean || !codeClean) {
      return NextResponse.json(
        { error: "Phone number and verification code are required." },
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

    // 1. Verify OTP code with Twilio Verify API v2 service
    const verifyCheck = await checkTwilioVerifyOtp(normalizedPhone, codeClean);

    // Accept ONLY status === "approved"
    if (!verifyCheck.approved) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Store approved server-side registration-phone verification record in MongoDB
    await OTPChallenge.findOneAndUpdate(
      { destination: normalizedPhone, purpose: "registration" },
      {
        channel: "sms",
        destination: normalizedPhone,
        codeHash: "TWILIO_VERIFY_APPROVED",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minute valid window for registration completion
        attempts: 0,
        verified: true,
        verifiedAt: new Date(),
        usedAt: null,
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
