import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import { sanitizeString } from "@/utils/validation";

import { checkAndUpdateSubscription } from "@/utils/checkSubscription";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Fetch questions in reverse chronological order
    const questions = await Question.find({})
      .populate("author", "name email avatarUrl points")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, questions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve questions." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const titleClean = sanitizeString(body.title);
    const contentClean = sanitizeString(body.content);
    const rawTags = body.tags || [];
    const tagsClean = Array.isArray(rawTags) ? rawTags.map(t => sanitizeString(t)).filter(Boolean) : [];

    if (!titleClean || !contentClean) {
      return NextResponse.json({ error: "Title and content cannot be empty." }, { status: 400 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const user = await checkAndUpdateSubscription(userId);
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const currentPlan = user.subscription?.plan || "Free";

    // Enforce limits: Free (1), Bronze (5), Silver (10), Gold (Unlimited)
    let limit = 1;
    if (currentPlan === "Bronze") limit = 5;
    else if (currentPlan === "Silver") limit = 10;
    else if (currentPlan === "Gold") limit = Infinity;

    if (limit !== Infinity) {
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const questionCountToday = await Question.countDocuments({
        author: userId,
        createdAt: { $gte: startOfToday },
      });

      if (questionCountToday >= limit) {
        return NextResponse.json(
          {
            error: `Daily question limit reached. Your subscription plan (${currentPlan}) allows up to ${limit} question${
              limit === 1 ? "" : "s"
            } per day.`,
          },
          { status: 403 }
        );
      }
    }

    const newQuestion = await Question.create({
      author: userId,
      title: titleClean,
      content: contentClean,
      tags: tagsClean,
      upvotes: [],
      downvotes: [],
      answersCount: 0,
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create question." }, { status: 500 });
  }
}
