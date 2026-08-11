import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Question from "@/models/Question";
import User from "@/models/User";
import HomeView from "@/components/home/HomeView";

export default async function Home() {
  const session = await getServerSession(authOptions);

  let recentQuestions: any[] = [];
  let userDetails: any = null;

  try {
    await connectToDatabase();

    if (session?.user) {
      const userId = (session.user as any).id;
      userDetails = await User.findById(userId)
        .select("name email points subscription friends")
        .lean();
    }

    const questions = await Question.find()
      .populate("author", "name avatarUrl image subscription")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentQuestions = questions.map((q: any) => ({
      id: q._id.toString(),
      title: q.title,
      body: q.body,
      tags: q.tags || [],
      votesCount: q.votesCount || 0,
      answersCount: q.answersCount || 0,
      viewsCount: q.viewsCount || 0,
      author: {
        name: q.author?.name || "Anonymous",
        avatarUrl: q.author?.avatarUrl || q.author?.image || "",
        subscription: q.author?.subscription?.plan || "Free",
      },
      createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Recently",
    }));
  } catch (error) {
    console.error("Home page data fetch error:", error);
  }

  return (
    <HomeView
      session={session}
      userDetails={userDetails}
      recentQuestions={recentQuestions}
    />
  );
}
