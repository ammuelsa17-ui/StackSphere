import mongoose, { Schema, model, models } from "mongoose";

const CommentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Comment must belong to a post"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },
    content: {
      type: String,
      required: [true, "Comment content cannot be empty"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
