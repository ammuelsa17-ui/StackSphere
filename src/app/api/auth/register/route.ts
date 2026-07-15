import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString, validateEmail, validatePhone, validatePassword } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const { name, email, password, phoneNumber } = await req.json();

    const nameClean = sanitizeString(name);
    const emailClean = sanitizeString(email);
    const phoneClean = sanitizeString(phoneNumber);

    // 1. Basic input validation
    if (!nameClean || !emailClean || !password) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, password)" },
        { status: 400 }
      );
    }

    if (!validateEmail(emailClean)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long and contain both letters and numbers" },
        { status: 400 }
      );
    }

    if (phoneClean && !validatePhone(phoneClean)) {
      return NextResponse.json(
        { error: "Please provide a valid phone number" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // 2. Check if a user already exists with this email
    const existingUser = await User.findOne({ email: emailClean });
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
      name: nameClean,
      email: emailClean,
      password: hashedPassword,
      phoneNumber: phoneClean || "",
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
    
    // Catch Mongoose validation errors (like invalid email structure)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages[0] || "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
