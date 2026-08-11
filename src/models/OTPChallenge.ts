import { Schema, model, models } from "mongoose";

const OTPChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["login", "forgot-password", "language-change", "registration"],
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
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
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

// Indexes
OTPChallengeSchema.index({ destination: 1, purpose: 1 });
OTPChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPChallenge = models.OTPChallenge || model("OTPChallenge", OTPChallengeSchema);

export default OTPChallenge;
