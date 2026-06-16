import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password, phoneNumber } = await req.json();

    // 1. Basic input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, password)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // 2. Check if a user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // 3. Hash the user's password using bcrypt (salt factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create and save the new user record in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "",
      points: 0, // Set initial rewards points to 0
      subscription: {
        plan: "Free",
        paymentStatus: "active",
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // Free plan default 100 years
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
