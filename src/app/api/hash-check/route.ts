export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json({
      envPresent: false,
      uriSha256: "",
      uriLength: 0,
      host: "",
      database: "",
      hasLeadingWhitespace: false,
      hasTrailingWhitespace: false,
      hasQuotes: false,
      directMongoConn: "FAIL",
    });
  }

  const hasLeadingWhitespace = /^\s/.test(uri);
  const hasTrailingWhitespace = /\s$/.test(uri);
  const hasQuotes = /^["']|["']$/.test(uri.trim());

  const cleanUri = uri.trim().replace(/^["']|["']$/g, "");
  const sha256 = crypto.createHash("sha256").update(cleanUri).digest("hex");

  let host = "";
  let database = "";
  const match = cleanUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/);
  if (match) {
    host = match[3];
    database = match[4];
  }

  let directMongoConn = "FAIL";
  try {
    const conn = await mongoose.createConnection(cleanUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    if (conn.db) {
      const pingRes = await conn.db.admin().ping();
      if (pingRes && (pingRes.ok === 1 || pingRes.ok === true)) {
        directMongoConn = "PASS";
      }
    }
    await conn.close();
  } catch (err: any) {
    directMongoConn = "FAIL";
  }

  return NextResponse.json({
    envPresent: true,
    uriSha256: sha256,
    uriLength: cleanUri.length,
    host,
    database,
    hasLeadingWhitespace,
    hasTrailingWhitespace,
    hasQuotes,
    directMongoConn,
  });
}
