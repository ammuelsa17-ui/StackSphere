import mongoose, { Schema, model, models } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Subscription must belong to a user"],
    },
    planName: {
      type: String,
      enum: ["Free", "Bronze", "Silver", "Gold"],
      required: [true, "Plan name is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Subscription = models.Subscription || model("Subscription", SubscriptionSchema);

export default Subscription;
