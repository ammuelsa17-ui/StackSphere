import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is missing.");
  process.exit(1);
}

async function resetTestState() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database handle unavailable.");
      process.exit(1);
    }

    const usersCollection = db.collection("users");
    const otpCollection = db.collection("otpchallenges");

    // Target test phone number and email
    const phoneFilter = {
      $or: [
        { phoneNumber: "+918248149740" },
        { phoneNumber: "8248149740" },
        { email: "ammuelsa17@gmail.com" }
      ]
    };

    const targetUsers = await usersCollection.find(phoneFilter).toArray();

    if (targetUsers.length === 0) {
      console.log("No matching test account found for +918248149740 or ammuelsa17@gmail.com.");
    } else {
      for (const u of targetUsers) {
        // Reset lastForgotPasswordRequestedAt & recovery fields
        await usersCollection.updateOne(
          { _id: u._id },
          {
            $unset: {
              lastForgotPasswordRequestedAt: "",
              resetPasswordToken: "",
              resetPasswordExpires: ""
            }
          }
        );

        // Remove active forgot-password OTP challenges
        await otpCollection.deleteMany({
          userId: u._id,
          purpose: "forgot-password"
        });

        console.log(`Successfully reset recovery test state for user account ID: ${u._id}`);
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Recovery test state successfully cleared.");
  } catch (err: any) {
    console.error("Error resetting test state:", err.message);
    process.exit(1);
  }
}

resetTestState();
