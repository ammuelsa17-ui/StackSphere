import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import User from "@/models/User";
import Reward from "@/models/Reward";
import { sanitizeString } from "@/utils/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const answers = await Answer.find({ questionId: id })
      .populate("author", "name email avatarUrl points")
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, answers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve answers." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const contentClean = sanitizeString(body.content);

    if (!contentClean) {
      return NextResponse.json({ error: "Answer content cannot be empty." }, { status: 400 });
    }

    await connectToDatabase();

    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;

    // 1. Create the new answer
    const newAnswer = await Answer.create({
      questionId: id,
      author: userId,
      content: contentClean,
      upvotes: [],
      downvotes: [],
      isAccepted: false,
    });

    // 2. Increment question answersCount
    question.answersCount = (question.answersCount || 0) + 1;
    await question.save();

    // 3. Reward points to author (Day 47: Implement answer reward logic (+5 points per answer))
    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + 5;
      await user.save();

      // Log reward history transaction
      await Reward.create({
        userId,
        points: 5,
        action: "answer_created",
        details: `Answered question: "${question.title}"`,
      });
    }

    return NextResponse.json({ success: true, answer: newAnswer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit answer." }, { status: 500 });
  }
}
