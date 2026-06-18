import mongoose, { Schema, model, models } from "mongoose";

// Schema for logging user login metadata
const LoginHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    ipAddress: {
      type: String,
      required: [true, "IP Address is required"],
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      required: [true, "Browser is required"],
      default: "Unknown",
    },
    os: {
      type: String,
      required: [true, "OS is required"],
      default: "Unknown",
    },
    deviceType: {
      type: String,
      required: [true, "Device type is required"],
      default: "Desktop",
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Prevent compile errors on hot-reloading in Next.js development
const LoginHistory = models.LoginHistory || model("LoginHistory", LoginHistorySchema);

export default LoginHistory;
