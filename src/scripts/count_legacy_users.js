const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI=(.*)/);
const uri = uriMatch[1].trim().replace(/^['"]|['"]$/g, "");

const { MongoClient } = require("mongodb");

async function countLegacyUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("users");

    const totalUsers = await users.countDocuments({});
    const legacyUsersLackingPhone = await users.countDocuments({
      $or: [
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: "" }
      ]
    });

    console.log(`TOTAL_USERS: ${totalUsers}`);
    console.log(`LEGACY_USERS_WITHOUT_PHONE: ${legacyUsersLackingPhone}`);
  } catch (err) {
    console.error("Count error:", err.message);
  } finally {
    await client.close();
  }
}

countLegacyUsers();
