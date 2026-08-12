const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
const uri = uriMatch[1].trim().replace(/^['"]|['"]$/g, "");

const { MongoClient } = require("mongodb");

async function trace() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas.");

    const db = client.db();
    const users = db.collection("users");
    const otps = db.collection("otpchallenges");

    const allUsers = await users.find({}).toArray();
    console.log(`Total users in collection: ${allUsers.length}`);

    for (const u of allUsers) {
      console.log("-----------------------------------------");
      console.log(`User ID: ${u._id}`);
      console.log(`Email: ${u.email}`);
      console.log(`Phone: ${u.phoneNumber}`);
      console.log(`lastForgotPasswordRequestedAt: ${u.lastForgotPasswordRequestedAt}`);
      console.log(`lastPasswordResetDate: ${u.lastPasswordResetDate}`);
      console.log(`resetPasswordToken: ${u.resetPasswordToken}`);

      const userOtps = await otps.find({ userId: u._id }).toArray();
      console.log(`OTP Challenges count for user: ${userOtps.length}`);
      for (const o of userOtps) {
        console.log(`  - Purpose: ${o.purpose}, Channel: ${o.channel}, CreatedAt: ${o.createdAt}`);
      }
    }
  } catch (err) {
    console.error("Trace failed:", err);
  } finally {
    await client.close();
  }
}

trace();
