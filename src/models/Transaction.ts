import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Transaction must belong to a user"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentId: {
      type: String,
      required: [true, "Payment gateway transaction ID is required"],
    },
    planName: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      required: [true, "Purchased plan name is required"],
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: [true, "Transaction status is required"],
    },
    invoiceUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Transaction = models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
