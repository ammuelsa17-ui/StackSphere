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
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  // Reset stale or failed connection state
  cached.conn = null;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    cached.promise = null;
    cached.conn = null;

    const errorName = error?.name || "MongoConnectionError";
    const errorCode = error?.code || "UNKNOWN";
    const rawMessage = error?.errmsg || error?.message || "Failed to establish database connection";
    const category = errorName === "MongoServerError" && errorCode === 8000 ? "AuthenticationFailed" : errorName;
    const sanitizedMsg = rawMessage.replace(/mongodb(\+srv)?:\/\/[^@]+@/, "mongodb+srv://[REDACTED_CREDS]@");

    // Preserve useful diagnostic info in server logs without exposing secret credentials
    console.error("MongoDB connection failed:", {
      name: errorName,
      code: errorCode,
      category,
      message: sanitizedMsg,
    });

    const customError: any = new Error(`MongoDB Connection Error [${category}]: ${sanitizedMsg}`);
    customError.name = errorName;
    customError.code = errorCode;
    customError.category = category;
    throw customError;
  }

  return cached.conn;
}

export default connectToDatabase;
