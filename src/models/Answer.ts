import { Schema, model, models } from "mongoose";

const AnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Answer must belong to a question"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Answer author is required"],
    },
    content: {
      type: String,
      required: [true, "Answer content cannot be empty"],
      trim: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AnswerSchema.index({ questionId: 1, createdAt: -1 });

delete (models as any).Answer;
const Answer = models.Answer || model("Answer", AnswerSchema);

export default Answer;
