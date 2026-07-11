import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { identity, code } = await req.json();

    if (!identity || identity.trim() === "") {
      return NextResponse.json(
        { error: "Email address or phone number is required." },
        { status: 400 }
      );
    }

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "Verification code is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const identityClean = identity.trim();
    // Query user by email or phone number
    const user = await User.findOne({
      $or: [
        { email: identityClean.toLowerCase() },
        { phoneNumber: identityClean },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with the provided details." },
        { status: 404 }
      );
    }

    // Verify code match and expiration
    const codeMatches = user.verificationCode === code.trim();
    const codeActive = user.verificationCodeExpires && user.verificationCodeExpires > new Date();

    if (!codeMatches || !codeActive) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Clear verification fields immediately upon success (one-time use)
    user.verificationCode = "";
    user.verificationCodeExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Verification code verified successfully.",
      resetToken: user.resetPasswordToken, // Return token for reset form
    });
  } catch (error: any) {
    console.error("Verify code route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
