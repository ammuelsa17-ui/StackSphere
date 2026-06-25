import mongoose, { Schema, model, models } from "mongoose";

const UploadSchema = new Schema(
  {
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Media uploader reference is required"],
    },
    filename: {
      type: String,
      required: [true, "Saved filename is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
    },
    mimeType: {
      type: String,
      required: [true, "Media MIME type is required"],
    },
    size: {
      type: Number,
      required: [true, "Media file size is required"],
    },
    url: {
      type: String,
      required: [true, "Media URL is required"],
      unique: true,
    },
    associatedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
  },
  {
    timestamps: true, // Captures upload timestamps
  }
);

// Prevent re-compilation errors during Next.js hot-reloads
const Upload = models.Upload || model("Upload", UploadSchema);

export default Upload;
