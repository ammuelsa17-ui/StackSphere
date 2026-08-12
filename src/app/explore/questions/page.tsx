import React, { Suspense } from "react";
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
      authorName: q.author?.name || q.author?.email?.split("@")[0] || "Developer Community Member",
      authorId: q.author?._id ? q.author._id.toString() : "",
    }));
  } catch (err) {
    console.error("Public questions fetch error:", err);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-neutral-500">Loading Q&A Community...</div>}>
      <PublicQuestionsView initialQuestions={questions} />
    </Suspense>
  );
}
