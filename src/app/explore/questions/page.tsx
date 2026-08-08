import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 mb-16 md:mb-0">
          <PublicQuestionsView initialQuestions={questions} />
        </main>
      </div>
    </div>
  );
}
