import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString, validatePassword } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const tokenClean = sanitizeString(token);

    if (!tokenClean) {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long and contain both letters and numbers." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query user by matching reset token that has not expired yet
    const user = await User.findOne({
      resetPasswordToken: tokenClean,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return NextResponse.json(
        { error: "Reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // Encrypt/hash the new password using bcryptjs
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Save changes and clear recovery fields
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset.",
    });
  } catch (error: any) {
    console.error("Reset password route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting password." },
      { status: 500 }
    );
  }
}
