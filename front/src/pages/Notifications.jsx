import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, BookOpen, Loader2, Trash2 } from "lucide-react";
import {
  clearNotificationHistory,
  getMyNotifications,
  markNotificationsRead,
} from "../data/userEndPoint";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
  });

  const readAllMutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearNotificationHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading notifications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
            Inbox
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Notifications
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {readAllMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || !notifications.length}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-60 dark:border-red-900/40 dark:text-red-300"
          >
            <Trash2 size={16} />
            {clearMutation.isPending ? "Clearing..." : "Clear history"}
          </button>
        </div>
      </header>

      <section className="space-y-4">
        {notifications.length ? (
          notifications.map((item) => (
            <article
              key={item.notificationId}
              className={`rounded-[2rem] border p-5 shadow-sm ${
                item.read
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/80 p-3 text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title || "Library update"}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.message}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No notifications yet.
          </div>
        )}
      </section>
    </div>
  );
}
