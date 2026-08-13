import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditProfileForm from "@/components/profile/EditProfileForm";
import PointsDashboard from "@/components/profile/PointsDashboard";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import { checkAndUpdateSubscription } from "@/utils/checkSubscription";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile - StackSphere",
  description: "View and update your personal StackSphere user profile and activity overview.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  await connectToDatabase();

  const userData = await checkAndUpdateSubscription((session.user as any).id);

  if (!userData) {
    redirect("/login");
  }

  const userObj = {
    id: userData._id.toString(),
    name: userData.name,
    email: userData.email,
    phoneNumber: userData.phoneNumber || "",
    points: userData.points || 0,
    subscription: {
      plan: userData.subscription?.plan || "Free",
    },
    createdAt: userData.createdAt.toISOString(),
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <ProfileHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProfileCard user={userObj} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <EditProfileForm initialUser={userObj} />
          <PointsDashboard initialPoints={userObj.points} />
          <DeleteAccountSection />
        </div>
      </div>
    </div>
  );
}
