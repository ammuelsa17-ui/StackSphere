import { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Question author is required"],
    },
    title: {
      type: String,
      required: [true, "Question title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Question content cannot be empty"],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
    answersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ createdAt: -1 });

delete (models as any).Question;
const Question = models.Question || model("Question", QuestionSchema);

export default Question;
