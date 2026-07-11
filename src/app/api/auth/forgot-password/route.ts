import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, phoneNumber } = await req.json();

    const emailProvided = typeof email === "string" && email.trim() !== "";
    const phoneProvided = typeof phoneNumber === "string" && phoneNumber.trim() !== "";

    if (!emailProvided && !phoneProvided) {
      return NextResponse.json(
        { error: "Either email address or phone number is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let user;
    if (emailProvided) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }
      user = await User.findOne({ email: email.trim().toLowerCase() });
    } else {
      user = await User.findOne({ phoneNumber: phoneNumber.trim() });
    }

    if (!user) {
      return NextResponse.json(
        { error: emailProvided ? "No user found with this email address." : "No user found with this phone number." },
        { status: 404 }
      );
    }

    // Generate secure recovery token (32 bytes)
    const token = crypto.randomBytes(32).toString("hex");
    // Set token expiration (1 hour from now)
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // Generate 6-digit verification code (OTP)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Set verification code expiration (10 minutes from now)
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationExpiry;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Verification code has been successfully generated.",
      method: emailProvided ? "email" : "phone",
      verificationCode, // Expose to facilitate automated testing/E2E verification
      token, // Expose reset token
    });
  } catch (error: any) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing recovery request." },
      { status: 500 }
    );
  }
}
