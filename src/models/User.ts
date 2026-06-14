import mongoose, { Schema, model, models } from "mongoose";

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
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
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
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Prevent compile errors on hot-reloading in Next.js development
const User = models.User || model("User", UserSchema);

export default User;
