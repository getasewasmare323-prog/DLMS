import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { createForumReply, getForumThread } from "../data/forumEndpoint";

const timeAgo = (value) => {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

export default function ThreadDetail() {
  const { id } = useParams();
  const [reply, setReply] = useState("");
  const queryClient = useQueryClient();

  const {
    data: thread,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forum-thread", id],
    queryFn: () => getForumThread(id),
  });

  const replyMutation = useMutation({
    mutationFn: (payload) => createForumReply(id, payload),
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["forum-thread", id] });
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading discussion...
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          {error?.message || "Thread not found."}
        </p>
        <Link to="/forum" className="mt-4 inline-block font-semibold text-emerald-600">
          Back to discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/forum"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
            Study Thread
          </p>
          <h1 className="mt-1 text-3xl font-serif font-bold text-zinc-900 dark:text-white">
            {thread.topic}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Started by {thread.starter?.fullName || "Student"}{" "}
            {thread.starter?.classLevel ? `for Grade ${thread.starter.classLevel}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {thread.posts.map((post, index) => (
          <article
            key={post.postId}
            className={`rounded-[2rem] border p-6 shadow-sm ${
              index === 0
                ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {post.author?.fullName || "Student"}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  {post.author?.role || "student"}
                </p>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {timeAgo(post.createdAt)}
              </p>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {post.content}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <MessageSquare size={18} />
            </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
              Reply to discussion
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Keep it clear, respectful, and helpful for other students.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            replyMutation.mutate({ content: reply });
          }}
          className="mt-5 space-y-4"
        >
          <textarea
            rows="5"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            placeholder="Write your reply..."
          />

          {replyMutation.isError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {replyMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={replyMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {replyMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MessageSquare size={18} />
            )}
            Post reply
          </button>
        </form>
      </div>
    </div>
  );
}
