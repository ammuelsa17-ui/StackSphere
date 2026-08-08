import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import PublicQuestionsView from "@/components/explore/PublicQuestionsView";

export const metadata = {
  title: "Public Q&A Community - StackSphere",
  description: "Browse public developer questions, answer technical challenges, and explore the StackSphere developer community.",
};

export default async function PublicQuestionsPage() {
  let questions: any[] = [];

  try {
    await connectToDatabase();
    const rawQuestions = await Question.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "name email")
      .lean();

    questions = rawQuestions.map((q: any) => ({
      _id: q._id.toString(),
      title: q.title || "Untitled Technical Question",
      content: q.content || "",
      tags: Array.isArray(q.tags) ? q.tags : [],
      answersCount: Array.isArray(q.answers) ? q.answers.length : 0,
      views: q.views || 1,
      createdAt: q.createdAt ? new Date(q.createdAt).toISOString() : new Date().toISOString(),
      authorName: q.author?.name || "Developer Community Member",
    }));
  } catch (err) {
    console.error("Public questions fetch error:", err);
  }

  return <PublicQuestionsView initialQuestions={questions} />;
}
