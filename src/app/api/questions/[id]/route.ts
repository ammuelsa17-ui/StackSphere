import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import Answer from "@/models/Answer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const question = await Question.findById(id).populate("author", "name email avatarUrl points").lean();
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    const answers = await Answer.find({ questionId: id })
      .populate("author", "name email avatarUrl points")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        question: {
          ...question,
          answers,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve question details." }, { status: 500 });
  }
}

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

    const currentUserId = (session.user as any).id;
    await connectToDatabase();

    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    if (question.author.toString() !== currentUserId.toString()) {
      return NextResponse.json({ error: "You can only delete your own question." }, { status: 403 });
    }

    await Answer.deleteMany({ questionId: id });
    await Question.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Question deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete question." }, { status: 500 });
  }
}
