import React from "react";
import { BookOpen } from "lucide-react";

export default function MyOfflineAccess() {
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <BookOpen size={24} />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
        Offline access removed
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
        The library now supports physical borrowing and direct access to
        available digital resources. Offline access and digital borrowing have
        been removed from the current workflow.
      </p>
    </div>
  );
}
