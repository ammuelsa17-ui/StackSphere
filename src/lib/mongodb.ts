import mongoose from "mongoose";

// Retrieve the MongoDB Connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error if the environment variable is missing
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

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
  // If we already have an active database connection, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise yet, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering to report errors quickly
    };

    // Start connecting to MongoDB
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log("=> Successfully connected to MongoDB Database!");
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the promise cache so we can try again on the next request
    cached.promise = null;
    console.error("=> Failed to connect to MongoDB Database:", error);
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
