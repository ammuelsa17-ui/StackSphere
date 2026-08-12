const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
const uri = uriMatch[1].trim().replace(/^['"]|['"]$/g, "");

const { MongoClient } = require("mongodb");

async function resetSwipeharsh() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("users");
    const otps = db.collection("otpchallenges");

    const filter = { email: "swipeharsh2001@gmail.com" };

    const userRes = await users.updateMany(filter, {
      $unset: {
        lastForgotPasswordRequestedAt: "",
        resetPasswordToken: "",
        resetPasswordExpires: ""
      }
    });

    const targetUsers = await users.find(filter).toArray();
    const userIds = targetUsers.map(u => u._id);

    const otpRes = await otps.deleteMany({
      userId: { $in: userIds },
      purpose: "forgot-password"
    });

    console.log(`[RESET SUCCESS] Accounts cleared: ${userRes.modifiedCount}. OTPs deleted: ${otpRes.deletedCount}.`);
  } catch (err) {
    console.error("Reset error:", err.message);
  } finally {
    await client.close();
  }
}

resetSwipeharsh();
