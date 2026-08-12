"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  HelpCircle,
  PlusCircle,
  MessageSquare,
  Eye,
  Tag,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  X,
  Send,
  Loader2,
  Trash2,
  FileText,
  Globe,
} from "lucide-react";
import ExploreCrossNav from "./ExploreCrossNav";
import { useTranslation } from "@/components/providers/I18nProvider";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";

interface PublicQuestion {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  answersCount: number;
  views: number;
  createdAt: string;
  authorName: string;
  authorId?: string;
  upvotes?: string[];
  downvotes?: string[];
}

interface PublicQuestionsViewProps {
  initialQuestions: PublicQuestion[];
}

export default function PublicQuestionsView({ initialQuestions }: PublicQuestionsViewProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const currentUserId = (session?.user as any)?.id;

  const [questions, setQuestions] = useState<PublicQuestion[]>(initialQuestions);
  const [activeFilter, setActiveFilter] = useState<"all" | "mine">(
    searchParams.get("filter") === "mine" ? "mine" : "all"
  );
  const [allowance, setAllowance] = useState<{
    plan: string;
    dailyLimit: number | string;
    usedToday: number;
    remaining: number | string;
  } | null>(null);

  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [authGateAction, setAuthGateAction] = useState("ask a question");

  // Ask Question Modal State
  const [showAskModal, setShowAskModal] = useState(searchParams.get("action") === "ask");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Active Question Detail Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswerContent, setNewAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // Fetch live questions & user allowance
  const fetchQuestionsData = async () => {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(
          data.questions.map((q: any) => ({
            _id: q._id,
            title: q.title || "Untitled Technical Question",
            content: q.content || "",
            tags: q.tags || [],
            answersCount: q.answersCount || q.answers?.length || 0,
            views: q.views || 1,
            createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "Just now",
            authorName: q.author?.name || q.author?.email?.split("@")[0] || "Anonymous",
            authorId: q.author?._id ? String(q.author._id) : String(q.author || ""),
            upvotes: q.upvotes || [],
            downvotes: q.downvotes || [],
          }))
        );
        if (data.allowance) {
          setAllowance(data.allowance);
        }
      }
    } catch (err) {
      console.error("Failed to refresh questions", err);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, [session]);

  useEffect(() => {
    if (searchParams.get("action") === "ask") {
      if (session) {
        setShowAskModal(true);
      } else {
        setAuthGateAction("ask a new question");
        setShowAuthGateModal(true);
      }
    }
    if (searchParams.get("filter") === "mine") {
      setActiveFilter("mine");
    }
  }, [searchParams, session]);

  const handleAskClick = () => {
    if (!session) {
      setAuthGateAction("ask a new question");
      setShowAuthGateModal(true);
      return;
    }
    setQuestionError(null);
    setShowAskModal(true);
  };

  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmittingQuestion(true);
    setQuestionError(null);

    try {
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: tagsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to post question.");
      }

      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setShowAskModal(false);
      await fetchQuestionsData();
    } catch (err: any) {
      setQuestionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleOpenQuestionDetails = async (q: PublicQuestion) => {
    try {
      const res = await fetch(`/api/questions/${q._id}`);
      const data = await res.json();
      if (data.question) {
        setSelectedQuestion(data.question);
        setAnswers(data.question.answers || []);
      } else {
        setSelectedQuestion(q);
        setAnswers([]);
      }
    } catch (err) {
      setSelectedQuestion(q);
      setAnswers([]);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedQuestion?._id === questionId) {
          setSelectedQuestion(null);
        }
        await fetchQuestionsData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete question.");
      }
    } catch (err) {
      console.error("Delete question error", err);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setAuthGateAction("submit an answer");
      setShowAuthGateModal(true);
      return;
    }
    if (!newAnswerContent.trim() || !selectedQuestion) return;

    setIsSubmittingAnswer(true);
    setAnswerError(null);

    try {
      const res = await fetch(`/api/questions/${selectedQuestion._id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newAnswerContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post answer.");
      }

      setNewAnswerContent("");
      await handleOpenQuestionDetails(selectedQuestion);
      await fetchQuestionsData();
    } catch (err: any) {
      setAnswerError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!session) {
      setAuthGateAction("vote on answers");
      setShowAuthGateModal(true);
      return;
    }
    try {
      const res = await fetch(`/api/answers/${answerId}/upvote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await handleOpenQuestionDetails(selectedQuestion);
      } else {
        alert(data.error || "Upvote failed.");
      }
    } catch (err) {
      console.error("Upvote error", err);
    }
  };

  const handleDownvoteAnswer = async (answerId: string) => {
    if (!session) {
      setAuthGateAction("vote on answers");
      setShowAuthGateModal(true);
      return;
    }
    try {
      const res = await fetch(`/api/answers/${answerId}/downvote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await handleOpenQuestionDetails(selectedQuestion);
      } else {
        alert(data.error || "Downvote failed.");
      }
    } catch (err) {
      console.error("Downvote error", err);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Are you sure you want to delete this answer?")) return;
    try {
      const res = await fetch(`/api/answers/${answerId}/delete`, { method: "DELETE" });
      if (res.ok) {
        await handleOpenQuestionDetails(selectedQuestion);
        await fetchQuestionsData();
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const displayedQuestions = questions.filter((q) => {
    if (activeFilter === "mine" && currentUserId) {
      return String(q.authorId) === String(currentUserId);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
              💬
            </div>
            <div>
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                {t("qaCommunity")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                {t("questionsTitle")}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAskClick}
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-extrabold text-sm rounded-2xl hover:bg-indigo-50 shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>{t("askQuestion")}</span>
          </button>
        </div>

        <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
          {t("qaFeatureDesc")}
        </p>

        {allowance && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/60 border border-white/20 rounded-xl text-xs text-indigo-100 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              Your Allowance ({allowance.plan} Plan): <strong>{allowance.usedToday}</strong> / {allowance.dailyLimit} questions used today
            </span>
          </div>
        )}
      </div>

      {/* Centralized Plan Question Allowances Overview Card */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            {t("plansPricing")} & Question Allowances
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-3 rounded-xl border ${
                plan.id === "bronze"
                  ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50"
                  : plan.id === "silver"
                  ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  : plan.id === "gold"
                  ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50"
                  : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                {t(plan.nameKey)} {plan.price !== "₹0" ? plan.price : ""}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                {t(plan.allowanceKey)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>All Community Questions ({questions.length})</span>
          </button>

          {session && (
            <button
              type="button"
              onClick={() => setActiveFilter("mine")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === "mine"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>My Questions</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {displayedQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
            <HelpCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="font-bold text-neutral-700 dark:text-neutral-300">
              {activeFilter === "mine" ? "You haven't asked any questions yet" : "No questions posted yet"}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {activeFilter === "mine" ? "Click 'Ask Question' above to submit your first question!" : "Be the first to ask a technical question on StackSphere!"}
            </p>
          </div>
        ) : (
          displayedQuestions.map((q) => {
            const isMyQuestion = currentUserId && String(q.authorId) === String(currentUserId);
            return (
              <div
                key={q._id}
                className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl space-y-3 hover:border-indigo-400 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{q.authorName}</span>
                    {isMyQuestion && (
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-bold text-[10px]">
                        Author (You)
                      </span>
                    )}
                  </div>
                  <span>{q.createdAt}</span>
                </div>

                <h3
                  onClick={() => handleOpenQuestionDetails(q)}
                  className="font-extrabold text-base text-neutral-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  {q.title}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {q.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700/60 text-xs">
                  <div className="flex gap-1.5 flex-wrap">
                    {q.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-md font-mono text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {q.answersCount} {t("answers")}
                    </span>

                    {isMyQuestion && (
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenQuestionDetails(q)}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      View Details & Answers →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ExploreCrossNav currentPath="/explore/questions" />

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-indigo-600" />
                <span>Ask a Question</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {questionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                {questionError}
              </div>
            )}

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Question Title *
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How does a circular linked list work?"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Question Details / Body *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your technical problem or query in detail..."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="algorithms, dsa, linked-list"
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Post Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Details & Answers Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-2xl w-full p-6 rounded-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 dark:border-neutral-700 pb-4">
              <div>
                <span className="text-xs font-semibold text-neutral-500">
                  Asked by {selectedQuestion.author?.name || selectedQuestion.authorName || "User"}
                </span>
                <h2 className="font-extrabold text-xl text-neutral-900 dark:text-white mt-1">
                  {selectedQuestion.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
              {selectedQuestion.content}
            </p>

            {/* Answer List Section */}
            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <span>Answers ({answers.length})</span>
              </h3>

              {answers.length === 0 ? (
                <div className="p-6 text-center bg-neutral-50 dark:bg-neutral-900 rounded-xl text-xs text-neutral-500">
                  No answers posted yet. Be the first to post an answer!
                </div>
              ) : (
                answers.map((ans) => {
                  const authorIdStr = ans.author?._id ? String(ans.author._id) : String(ans.author || "");
                  const isOwnAnswer = currentUserId && String(authorIdStr) === String(currentUserId);
                  const score = (ans.upvotes?.length || 0) - (ans.downvotes?.length || 0);

                  return (
                    <div
                      key={ans._id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {ans.author?.name || ans.author?.email?.split("@")[0] || "User"}
                        </span>
                        <span>{ans.createdAt ? new Date(ans.createdAt).toLocaleDateString() : ""}</span>
                      </div>

                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {ans.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleUpvoteAnswer(ans._id)}
                            className="flex items-center gap-1 font-bold text-neutral-600 hover:text-indigo-600 cursor-pointer"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>Upvote ({ans.upvotes?.length || 0})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownvoteAnswer(ans._id)}
                            className="flex items-center gap-1 font-bold text-neutral-600 hover:text-rose-600 cursor-pointer"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span>Downvote ({ans.downvotes?.length || 0})</span>
                          </button>
                          <span className="font-mono font-bold text-neutral-900 dark:text-white">
                            Score: {score}
                          </span>
                        </div>

                        {isOwnAnswer && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnswer(ans._id)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Answer Form / Guest Login CTA */}
            {session?.user ? (
              <form onSubmit={handleAnswerSubmit} className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                  Your Answer (+5 Reward Points)
                </h4>

                {answerError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                    {answerError}
                  </div>
                )}

                <textarea
                  required
                  rows={3}
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  placeholder="Write your technical answer here..."
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAnswer}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingAnswer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Submit Answer</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-center space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  Please log in to answer this question and earn +5 reward points!
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Login to answer this question</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unauthenticated Auth Gate Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-sm w-full p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>

            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              {t("signInTitle")}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Please sign in to {authGateAction}.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="flex-1 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <Link
                href="/login"
                className="flex-1 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-1"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{t("signIn")}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
