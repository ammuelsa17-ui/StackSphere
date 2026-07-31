import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { sanitizeString } from "@/utils/validation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || "";
    const q = sanitizeString(rawQuery);

    if (q.length < 2) {
      return NextResponse.json({ success: true, users: [] }, { status: 200 });
    }

    await connectToDatabase();

    const activeUserId = (session.user as any).id;

    // Search users by name or email, excluding the active user
    const users = await User.find({
      _id: { $ne: activeUserId },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("name email avatarUrl points")
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to search users." }, { status: 500 });
  }
}
