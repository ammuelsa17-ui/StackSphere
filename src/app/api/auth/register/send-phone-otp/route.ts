import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString, normalizePhone } from "@/utils/validation";
import { sendTwilioVerifyOtp } from "@/utils/sms";

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

    // 2. Dispatch SMS via Twilio Verify API v2 service
    const verifyResult = await sendTwilioVerifyOtp(normalizedPhone);

    if (!verifyResult.success) {
      const code = verifyResult.errorCode || "VERIFY_DISPATCH_FAILURE";
      let userMsg = "Failed to send SMS verification code. Please check your phone number or try again later.";
      
      if (code === "MISSING_VERIFY_SERVICE") {
        userMsg = "TWILIO VERIFY CONFIGURATION MISSING: TWILIO_VERIFY_SERVICE_SID environment variable is missing on Vercel environment.";
      }

      return NextResponse.json(
        {
          error: userMsg,
          providerErrorCode: code,
          category: "VERIFY_DISPATCH_FAILURE",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent via Twilio Verify SMS.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the verification code." },
      { status: 500 }
    );
  }
}
