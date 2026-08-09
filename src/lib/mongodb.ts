import mongoose from "mongoose";

const rawUri = process.env.MONGODB_URI;

if (!rawUri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const MONGODB_URI = rawUri.trim().replace(/^["']|["']$/g, "");

/**
 * Next.js uses serverless routes which run on-demand. In development, hot-reloading
 * can cause database connections to multiply rapidly. To prevent this, we cache the
 * connection in a global variable that persists across hot-reloads.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    console.error("=> Failed to connect to MongoDB Database:", error?.message || error);
    throw new Error("Database service is temporarily unavailable. Please try again shortly or use email recovery.");
  }

  return cached.conn;
}

export default connectToDatabase;
