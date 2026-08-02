import { Schema, model, models } from "mongoose";

const OTPChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["login", "forgot-password", "language-change"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms"],
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    pendingLanguage: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    resendAvailableAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce only one active challenge per user and purpose
OTPChallengeSchema.index({ userId: 1, purpose: 1 }, { unique: true });

// Automatic MongoDB TTL index to clean up expired challenges automatically
OTPChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPChallenge = models.OTPChallenge || model("OTPChallenge", OTPChallengeSchema);

export default OTPChallenge;
