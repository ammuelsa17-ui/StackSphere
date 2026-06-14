import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post author reference is required"],
    },
    content: {
      type: String,
      required: [true, "Post content cannot be empty"],
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "none"],
      default: "none",
    },
    // Array of User ObjectIds who liked this post
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Captures post creation and edit timestamps
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Post = models.Post || model("Post", PostSchema);

export default Post;
