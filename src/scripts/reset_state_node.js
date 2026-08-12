const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
const uri = uriMatch[1].trim().replace(/^['"]|['"]$/g, "");

const { MongoClient } = require("mongodb");

async function verifyCondition() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas.");

    const db = client.db();
    const users = db.collection("users");
    const otps = db.collection("otpchallenges");

    const phoneFilter = {
      $or: [
        { phoneNumber: "+918248149740" },
        { phoneNumber: "8248149740" },
        { email: "25csda45@karpagamtech.ac.in" }
      ]
    };

    const user = await users.findOne(phoneFilter);

    if (!user) {
      console.log("User account not found.");
      return;
    }

    console.log(`Matched Account ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Phone: ${user.phoneNumber}`);
    console.log(`lastForgotPasswordRequestedAt: ${user.lastForgotPasswordRequestedAt}`);

    const now = new Date();
    const lastRequested = user.lastForgotPasswordRequestedAt ? new Date(user.lastForgotPasswordRequestedAt) : null;
    const isBlockedByDailyLimit = lastRequested && (now.getTime() - lastRequested.getTime() < 24 * 60 * 60 * 1000);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyOtps = await otps.countDocuments({
      userId: user._id,
      createdAt: { $gte: oneHourAgo }
    });

    const isBlockedByHourlyBurst = hourlyOtps >= 5;

    console.log("=========================================");
    console.log(`Daily Limit Blocked? : ${isBlockedByDailyLimit ? "TRUE (BLOCKED)" : "FALSE (ALLOWED ✅)"}`);
    console.log(`Hourly Burst Blocked?: ${isBlockedByHourlyBurst ? "TRUE (BLOCKED)" : "FALSE (ALLOWED ✅)"}`);
    console.log("=========================================");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await client.close();
  }
}

verifyCondition();
