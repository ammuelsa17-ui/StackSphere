export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString, validateEmail, normalizePhone, checkPasswordRequirements } from "@/utils/validation";
import crypto from "crypto";
import mongoose from "mongoose";

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

    const passwordPolicy = checkPasswordRequirements(password);
    if (!passwordPolicy.isValid) {
      return NextResponse.json(
        { error: passwordPolicy.firstMissingError || "Password does not meet security requirements." },
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

    // 2. Check if user already exists with this email or phone number independently
    const existingEmail = await User.findOne({ email: emailClean.toLowerCase() });
    let existingPhone = null;

    if (normalizedPhone) {
      existingPhone = await User.findOne({
        $or: [
          { phoneNumber: normalizedPhone },
          { phoneNumber: phoneClean },
        ],
      });
    }

    if (existingEmail && existingPhone) {
      return NextResponse.json(
        {
          error: "An account with this email address and phone number already exists. Please sign in.",
          duplicateField: "both",
        },
        { status: 400 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "This email address is already registered. Sign in or use a different email.",
          duplicateField: "email",
        },
        { status: 400 }
      );
    }

    if (existingPhone) {
      return NextResponse.json(
        {
          error: "This phone number is already registered. Use a different number or sign in.",
          duplicateField: "phone",
        },
        { status: 400 }
      );
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

    const safeMsg = error?.message?.replace(/mongodb(\+srv)?:\/\/[^@]+@/, "mongodb+srv://[REDACTED]@") || "Unable to create account. Please check your information and try again.";

    return NextResponse.json(
      { error: safeMsg },
      { status: 500 }
    );
  }
}
