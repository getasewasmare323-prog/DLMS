import React from "react";
import { RANKED_RESOURCES } from "../data/mockData";
import { Star } from "lucide-react";

export default function ResourceRanking() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          Resource Rankings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Top-rated resources according to students.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-brand-100 dark:border-zinc-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Resource
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Rating
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Votes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {RANKED_RESOURCES.map((r) => (
              <tr
                key={r.id}
                className="transition-colors bg-transparent hover:bg-emerald-50 dark:hover:bg-zinc-800/30"
              >
                <td className="px-6 py-4">{r.title}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Star
                    size={16}
                    className="text-amber-400 dark:text-amber-300"
                  />
                  <span className="font-semibold text-zinc-800 dark:text-white">
                    {r.rating}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                  {r.votes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
