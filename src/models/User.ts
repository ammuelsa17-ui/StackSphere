import { Schema, model, models } from "mongoose";

// Subscription sub-schema for user profiles
const SubscriptionSchema = new Schema({
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "active", "expired"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    // Default to a long time for Free plan (e.g. 100 years), will be updated upon payment
    default: () => new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
  },
});

// Main User Schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Prevents password from being returned in API queries by default
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Array of ObjectIds pointing to other User documents (friends list)
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Total reward points earned by the user
    points: {
      type: Number,
      default: 0,
    },
    // Embedded subscription plan details
    subscription: {
      type: SubscriptionSchema,
      default: () => ({}),
    },
    // Password reset recovery fields (hidden from default queries)
    resetPasswordToken: {
      type: String,
      default: "",
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // OTP verification recovery fields (hidden from default queries)
    verificationCode: {
      type: String,
      default: "",
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },
    lastForgotPasswordRequestedAt: {
      type: Date,
      default: null,
      select: false,
    },
    otpSentChannel: {
      type: String,
      default: "",
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    otpLastRequestedAt: {
      type: Date,
      default: null,
      select: false,
    },
    pendingLanguage: {
      type: String,
      default: "",
      select: false,
    },
    preferredLanguage: {
      type: String,
      default: "en",
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Prevent compile errors on hot-reloading in Next.js development
const User = models.User || model("User", UserSchema);

export default User;
