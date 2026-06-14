import mongoose, { Schema, model, models } from "mongoose";

const RewardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reward transaction must belong to a user"],
    },
    points: {
      type: Number,
      required: [true, "Points quantity is required"], // e.g. +5 or -5
    },
    action: {
      type: String,
      enum: [
        "answer_created",
        "answer_upvoted",
        "answer_downvoted",
        "answer_removed",
        "point_transfer_sent",
        "point_transfer_received",
      ],
      required: [true, "Action description is required"],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Used for transfers
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Used for transfers
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Reward = models.Reward || model("Reward", RewardSchema);

export default Reward;
