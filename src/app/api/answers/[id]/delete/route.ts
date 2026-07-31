import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import User from "@/models/User";
import Reward from "@/models/Reward";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const answer = await Answer.findById(id);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Verify user owns this answer
    if (answer.author.toString() !== userId.toString()) {
      return NextResponse.json({ error: "You can only delete your own answers." }, { status: 403 });
    }

    // 1. Decrement question answersCount
    const question = await Question.findById(answer.questionId);
    if (question) {
      question.answersCount = Math.max(0, (question.answersCount || 1) - 1);
      await question.save();
    }

    // 2. Day 49: Deduct points for removal (reversing creation reward)
    const author = await User.findById(userId);
    if (author) {
      // Base creation deduction
      let totalDeduction = 5;
      
      await Reward.create({
        userId,
        points: -5,
        action: "answer_removed",
        details: "Removed answer: creation points deducted.",
      });

      // Retract upvote bonus if answer had reached >= 5 upvotes
      if (answer.upvotes.length >= 5) {
        totalDeduction += 5;
        await Reward.create({
          userId,
          points: -5,
          action: "answer_removed",
          details: "Removed answer: upvote bonus retracted.",
        });
      }

      author.points = Math.max(0, (author.points || 0) - totalDeduction);
      await author.save();
    }

    // 3. Delete the answer
    await Answer.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Answer deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete answer." }, { status: 500 });
  }
}
