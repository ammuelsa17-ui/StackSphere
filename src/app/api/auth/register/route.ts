import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString, validateEmail, validatePhone, validatePassword, normalizePhone } from "@/utils/validation";

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

    let normalizedPhone = "";
    if (phoneClean) {
      const normalized = normalizePhone(phoneClean);
      if (normalized === null) {
        return NextResponse.json(
          { error: "Please enter a valid phone number." },
          { status: 400 }
        );
      }
      normalizedPhone = normalized;
    }

    // Connect to database
    await connectToDatabase();

    // 2. Check if a user already exists with this email or phone number
    const existingUser = await User.findOne({ email: emailClean.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address is already registered." },
        { status: 400 }
      );
    }

    if (normalizedPhone) {
      const existingPhone = await User.findOne({
        $or: [
          { phoneNumber: normalizedPhone },
          { phoneNumber: phoneClean },
        ],
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "A user with this phone number is already registered." },
          { status: 400 }
        );
      }
    }

    // 3. Hash the user's password using bcrypt (salt factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create and save the new user record in MongoDB
    const newUser = await User.create({
      name: nameClean,
      email: emailClean.toLowerCase(),
      password: hashedPassword,
      phoneNumber: normalizedPhone || "",
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

    // Catch Mongo duplicate key errors (code 11000)
    if (
      error.code === 11000 ||
      error.cause?.code === 11000 ||
      error.name === "MongoServerError" ||
      (error.message && error.message.includes("E11000"))
    ) {
      return NextResponse.json(
        { error: "A user with this email address or phone number is already registered." },
        { status: 400 }
      );
    }
    
    // Catch Mongoose validation errors (like invalid email structure)
    if (error.name === "ValidationError" && error.errors) {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages[0] || "Validation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create account. Please check your information and try again." },
      { status: 500 }
    );
  }
}
