import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import { sanitizeString } from "@/utils/validation";

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

    const newQuestion = await Question.create({
      author: (session.user as any).id,
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
