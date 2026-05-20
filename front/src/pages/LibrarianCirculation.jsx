import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookCopy,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  // UserRound,
} from "lucide-react";
import { returnBorrow } from "../data/resourceEndpoint";
import { sendDueDateReminders } from "../data/userEndPoint";
import { useMyBorrows, useOverdueBorrows } from "../hooks/useResources";

export default function LibrarianCirculation() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { borrows = [], isLoading, error } = useMyBorrows();
  const { overdueBorrows = [], isLoading: overdueLoading } =
    useOverdueBorrows();

  const returnMutation = useMutation({
    mutationFn: returnBorrow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-borrows"] });
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["resource-search"] });
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
    },
  });

  const reminderMutation = useMutation({
    mutationFn: sendDueDateReminders,
  });

  const filteredBorrows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return borrows;
    }

    return borrows.filter((item) => {
      const haystack = [
        item.resource?.title,
        item.resource?.subject,
        item.user?.firstName,
        item.user?.lastName,
        item.user?.email,
        item.borrowType,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [borrows, search]);

  const activeBorrows = filteredBorrows.filter(
    (item) => item.status === "active",
  );
  const returnedBorrows = filteredBorrows.filter(
    (item) => item.status === "returned",
  );
  const overdueFiltered = overdueBorrows.filter((item) => {
    if (!search.trim()) {
      return true;
    }

    const haystack = [
      item.resource?.title,
      item.resource?.subject,
      item.user?.firstName,
      item.user?.lastName,
      item.user?.email,
      item.borrowType,
      item.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.trim().toLowerCase());
  });

  if (isLoading || overdueLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading circulation records...
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
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
          Library Circulation
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Circulation Desk
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Review active loans, process returns, and watch overdue borrowing from
          one desk.
        </p>
        <button
          onClick={() => reminderMutation.mutate()}
          disabled={reminderMutation.isPending}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          <ShieldCheck size={16} />
          {reminderMutation.isPending
            ? "Sending reminders..."
            : "Send due date reminders"}
        </button>
      </header>

      <section className="grid gap-5 md:grid-cols-4">
        <StatCard
          label="All Transactions"
          value={filteredBorrows.length}
          icon={BookCopy}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          label="Active"
          value={activeBorrows.length}
          icon={Clock3}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
        />
        <StatCard
          label="Overdue"
          value={overdueFiltered.length}
          icon={AlertTriangle}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <StatCard
          label="Returned"
          value={returnedBorrows.length}
          icon={CheckCircle2}
          tone="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        />
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by borrower, title, type, or status..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Active and Recent Transactions
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Process physical returns and monitor recent circulation activity.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {filteredBorrows.length} records
            </span>
          </div>

          <div className="space-y-4">
            {filteredBorrows.length ? (
              filteredBorrows
                .slice(0, 20)
                .map((borrow) => (
                  <BorrowRecord
                    key={borrow.transactionId}
                    borrow={borrow}
                    isReturning={returnMutation.isPending}
                    onReturn={() => returnMutation.mutate(borrow.transactionId)}
                  />
                ))
            ) : (
              <EmptyPanel text="No circulation records match your current search." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Overdue Alerts
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Borrowers whose due dates have already passed.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {overdueFiltered.length ? (
                overdueFiltered.slice(0, 8).map((borrow) => (
                  <div
                    key={borrow.transactionId}
                    className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900/30 dark:bg-amber-950/10"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {borrow.resource?.title || "Library resource"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {[borrow.user?.firstName, borrow.user?.lastName]
                        .filter(Boolean)
                        .join(" ")}{" "}
                      | due {formatDate(borrow.dueAt)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyPanel text="No overdue records right now." />
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Desk Guidance
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                Use the catalog desk to update copy counts and shelf locations.
              </p>
              <p>
                Use this circulation page to process returns and monitor overdue
                activity.
              </p>
              <p>
                Use borrowing reports and the catalog desk to keep copy counts,
                return flow, and overdue handling accurate.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`inline-flex rounded-2xl p-3 ${tone}`}>
        <Icon size={20} />
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function BorrowRecord({ borrow, onReturn, isReturning }) {
  const borrowerName =
    [borrow.user?.firstName, borrow.user?.lastName].filter(Boolean).join(" ") ||
    "Library member";
  const canReturn = borrow.status === "active" || borrow.status === "overdue";

  return (
    <article className="rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="font-bold text-zinc-900 dark:text-zinc-100">
            {borrow.resource?.title || "Library resource"}
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em]">
            <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
              {borrow.borrowType}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {borrow.status}
            </span>
          </div>
          <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {/* <UserRound size={14} /> */}
            {borrowerName}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Borrowed {formatDate(borrow.borrowedAt)} | due{" "}
            {formatDate(borrow.dueAt)}
            {borrow.returnedAt
              ? ` | returned ${formatDate(borrow.returnedAt)}`
              : ""}
          </p>
        </div>

        {canReturn ? (
          <button
            onClick={onReturn}
            disabled={isReturning}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <RefreshCcw size={15} />
            Mark returned
          </button>
        ) : null}
      </div>
    </article>
  );
}

function EmptyPanel({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
      {text}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}
