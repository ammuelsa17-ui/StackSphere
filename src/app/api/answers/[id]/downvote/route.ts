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

    const voterIdStr = userId.toString();
    const authorIdStr = answer.author.toString();

    // Users cannot downvote their own answer
    if (voterIdStr === authorIdStr) {
      return NextResponse.json({ error: "You cannot downvote your own answer." }, { status: 400 });
    }

    const upvotesStrList = answer.upvotes.map((u: any) => u.toString());
    const downvotesStrList = answer.downvotes.map((d: any) => d.toString());

    // Toggle downvote
    if (downvotesStrList.includes(voterIdStr)) {
      // Remove downvote
      answer.downvotes = answer.downvotes.filter((d: any) => d.toString() !== voterIdStr);
      await answer.save();

      // Reverse downvote deduction: add 2 points back to author
      const author = await User.findById(answer.author);
      if (author) {
        author.points = (author.points || 0) + 2;
        await author.save();

        await Reward.create({
          userId: answer.author,
          points: 2,
          action: "answer_upvoted", // Reversing downvote
          details: "Removed downvote: points restored.",
        });
      }
    } else {
      // Add downvote
      answer.downvotes.push(userId);
      
      // If was previously upvoted, remove from upvotes
      if (upvotesStrList.includes(voterIdStr)) {
        answer.upvotes = answer.upvotes.filter((u: any) => u.toString() !== voterIdStr);
        
        // Retract upvote bonus if dropped below 5
        if (upvotesStrList.length === 5) {
          const author = await User.findById(answer.author);
          if (author) {
            author.points = Math.max(0, (author.points || 0) - 5);
            await author.save();

            await Reward.create({
              userId: answer.author,
              points: -5,
              action: "answer_downvoted",
              details: "Retracted upvote bonus: Answer fell below 5 upvotes due to downvote.",
            });
          }
        }
      }
      
      await answer.save();

      // Day 49: Add downvote/removal points deduction logic (-2 points for downvote)
      const author = await User.findById(answer.author);
      if (author) {
        author.points = Math.max(0, (author.points || 0) - 2);
        await author.save();

        await Reward.create({
          userId: answer.author,
          points: -2,
          action: "answer_downvoted",
          details: "Answer received a downvote.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process downvote." }, { status: 500 });
  }
}
