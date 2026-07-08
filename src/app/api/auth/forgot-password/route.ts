import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address." },
        { status: 404 }
      );
    }

    // Generate secure recovery token (32 bytes)
    const token = crypto.randomBytes(32).toString("hex");

    // Set token expiration (1 hour from now)
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password recovery link has been successfully generated.",
      token, // Expose token to facilitate verification and testing
    });
  } catch (error: any) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing recovery request." },
      { status: 500 }
    );
  }
}
