import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Answer from "@/models/Answer";
import User from "@/models/User";
import Reward from "@/models/Reward";

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

    const userId = (session.user as any).id;
    await connectToDatabase();

    const answer = await Answer.findById(id);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Convert ObjectIds to strings for accurate comparisons
    const voterIdStr = userId.toString();
    const authorIdStr = answer.author.toString();

    // Users cannot upvote their own answer
    if (voterIdStr === authorIdStr) {
      return NextResponse.json({ error: "You cannot upvote your own answer." }, { status: 400 });
    }

    const upvotesStrList = answer.upvotes.map((u: any) => u.toString());
    const downvotesStrList = answer.downvotes.map((d: any) => d.toString());

    // Toggle upvote
    if (upvotesStrList.includes(voterIdStr)) {
      // Remove upvote
      answer.upvotes = answer.upvotes.filter((u: any) => u.toString() !== voterIdStr);
      await answer.save();

      // If upvotes drop below 5 (e.g. from 5 to 4), we should deduct the upvote points
      if (upvotesStrList.length === 5) {
        const author = await User.findById(answer.author);
        if (author) {
          author.points = Math.max(0, (author.points || 0) - 5);
          await author.save();

          await Reward.create({
            userId: answer.author,
            points: -5,
            action: "answer_downvoted", // Or specific action for upvote retraction
            details: "Retracted upvote bonus: Answer fell below 5 upvotes.",
          });
        }
      }
    } else {
      // Add upvote
      answer.upvotes.push(userId);
      // Remove from downvotes if present
      answer.downvotes = answer.downvotes.filter((d: any) => d.toString() !== voterIdStr);
      await answer.save();

      // Day 48: Add upvote reward logic (+5 points when answer hits 5 upvotes)
      if (answer.upvotes.length === 5) {
        const author = await User.findById(answer.author);
        if (author) {
          author.points = (author.points || 0) + 5;
          await author.save();

          await Reward.create({
            userId: answer.author,
            points: 5,
            action: "answer_upvoted",
            details: "Answer reached 5 upvotes bonus!",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process upvote." }, { status: 500 });
  }
}
