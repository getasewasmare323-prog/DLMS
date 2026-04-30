import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquarePlus, MessagesSquare, Plus } from "lucide-react";
import { createForumThread, getForumThreads } from "../data/forumEndpoint";

const timeAgo = (value) => {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

export default function DiscussionForum() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ["forum-threads"],
    queryFn: getForumThreads,
  });

  const createMutation = useMutation({
    mutationFn: createForumThread,
    onSuccess: (data) => {
      setTopic("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      navigate(`/forum/${data.threadId}`);
    },
  });

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
              Study Discussion
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Ask, explain, and learn together
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              Start class discussions, ask for help with lessons, and reply to
              students and teachers inside the school learning community.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            {threads.length} active discussion{threads.length === 1 ? "" : "s"}
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/60">
            <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Recent Topics
            </h2>
          </div>

          {isLoading ? (
            <div className="grid min-h-[280px] place-items-center">
              <div className="text-center text-zinc-500 dark:text-zinc-400">
                <Loader2 className="mx-auto mb-3 animate-spin" size={28} />
                Loading study discussions...
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600 dark:text-red-400">
              {error.message}
            </div>
          ) : threads.length ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {threads.map((thread) => (
                <Link
                  key={thread.threadId}
                  to={`/forum/${thread.threadId}`}
                  className="block px-6 py-5 transition-colors hover:bg-emerald-50/60 dark:hover:bg-zinc-800/40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {thread.topic}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Started by {thread.starter?.fullName || "Student"}{" "}
                        {thread.starter?.classLevel
                          ? `(Grade ${thread.starter.classLevel})`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">
                        <MessagesSquare size={14} />
                        {thread.repliesCount} replies
                      </span>
                      <span>{timeAgo(thread.lastPost?.createdAt || thread.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-zinc-500 dark:text-zinc-400">
              No discussion has started yet. Be the first to ask a study question.
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Start a New Topic
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Open a respectful school discussion.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate({ topic, content });
            }}
            className="mt-6 space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Topic title
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="Example: How do I balance chemical equations?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                First message
              </label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="Write your question, explanation, or study tip..."
              />
            </div>

            {createMutation.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {createMutation.error.message}
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Post discussion
            </button>
          </form>
        </aside>
      </section>
    </div>
  );
}
