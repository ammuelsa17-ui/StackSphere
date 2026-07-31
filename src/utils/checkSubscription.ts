import User from "@/models/User";

/**
 * Checks if a user's subscription has expired.
 * If expired, it automatically resets the user's subscription back to the "Free" plan.
 * Returns the updated user document.
 * 
 * @param userId Mongoose User ObjectId string
 */
export async function checkAndUpdateSubscription(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) return null;

  const currentPlan = user.subscription?.plan || "Free";
  const expiryDate = user.subscription?.expiryDate;

  if (currentPlan !== "Free" && expiryDate && new Date(expiryDate).getTime() < Date.now()) {
    user.subscription = {
      plan: "Free",
      paymentStatus: "active",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // Free plan default 100 years
    };
    await user.save();
  }

  return user;
}
