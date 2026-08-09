export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json({
      envPresent: false,
      directRuntimeMongoPing: "FAIL",
      sharedHelperMongoPing: "FAIL",
    });
  }

  let directStatus = "FAIL";
  let sharedStatus = "FAIL";
  let errCategory = "";

  // Test A: Direct Fresh Connection without using shared helper/cache
  try {
    const cleanUri = uri.trim().replace(/^["']|["']$/g, "");
    const conn = await mongoose.createConnection(cleanUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    if (conn.db) {
      const pingRes = await conn.db.admin().ping();
      if (pingRes && (pingRes.ok === 1 || pingRes.ok === true)) {
        directStatus = "PASS";
      }
    }
    await conn.close();
  } catch (err: any) {
    directStatus = "FAIL";
    errCategory = err?.name === "MongoServerError" && err?.code === 8000 ? "AuthenticationFailed" : (err?.name || "UnknownError");
  }

  // Test B: Shared connectToDatabase() helper
  try {
    const sharedConn = await connectToDatabase();
    if (sharedConn && (sharedConn.readyState === 1 || sharedConn.connection?.readyState === 1)) {
      const db = sharedConn.db || sharedConn.connection?.db;
      if (db) {
        const pingRes = await db.admin().ping();
        if (pingRes && (pingRes.ok === 1 || pingRes.ok === true)) {
          sharedStatus = "PASS";
        }
      }
    }
  } catch (err: any) {
    sharedStatus = "FAIL";
    if (!errCategory) {
      errCategory = err?.name === "MongoServerError" && err?.code === 8000 ? "AuthenticationFailed" : (err?.name || "UnknownError");
    }
  }

  return NextResponse.json({
    envPresent: true,
    directRuntimeMongoPing: directStatus,
    sharedHelperMongoPing: sharedStatus,
    errorCategory: errCategory || "None",
  });
}
