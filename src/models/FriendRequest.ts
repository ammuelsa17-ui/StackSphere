import mongoose, { Schema, model, models } from "mongoose";

const FriendRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const FriendRequest = models.FriendRequest || model("FriendRequest", FriendRequestSchema);

export default FriendRequest;
