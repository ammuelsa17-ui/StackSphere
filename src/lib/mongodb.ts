import mongoose from "mongoose";

const DEFAULT_ATLAS_URI = "mongodb+srv://swipeharsh2001_db_user:mYi1ybEpO4wpARj7@stacksphere-cluster.r5nqte1.mongodb.net/stacksphere?retryWrites=true&w=majority&appName=stacksphere-cluster";
const rawUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
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

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .catch(async (err) => {
        console.warn("=> Primary MONGODB_URI failed, attempting fallback connection:", err?.message);
        if (MONGODB_URI !== DEFAULT_ATLAS_URI) {
          return mongoose.connect(DEFAULT_ATLAS_URI, opts);
        }
        throw err;
      })
      .then((mongooseInstance) => {
        console.log("=> Successfully connected to MongoDB Database!");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("=> Failed to connect to MongoDB Database:", error);
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
