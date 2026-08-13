import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Reward from "@/models/Reward";
import User from "@/models/User";

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const user = await User.findById(userId).select("points");
    const points = user?.points || 0;

    // Fetch user reward history
    const rewards = await Reward.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, points, rewards }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve rewards history." }, { status: 500 });
  }
}
