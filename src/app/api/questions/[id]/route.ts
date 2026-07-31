import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const question = await Question.findById(id).populate("author", "name email avatarUrl points");
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, question }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve question details." }, { status: 500 });
  }
}
