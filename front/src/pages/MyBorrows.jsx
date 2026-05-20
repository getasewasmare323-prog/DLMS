import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Library,
  Loader2,
  Search,
  // UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { clearBorrowHistory } from "../data/resourceEndpoint";
import { useLearningDashboard, useMyBorrows } from "../hooks/useResources";

export default function MyBorrows() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const isLibraryOperator =
    user?.role === "librarian" || user?.role === "admin";
  const {
    borrows = [],
    isLoading: borrowsLoading,
    error: borrowsError,
  } = useMyBorrows();
  const {
    dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useLearningDashboard();

  const borrowsSource = isLibraryOperator ? borrows : dashboard?.history || [];

  const filteredBorrows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return borrowsSource;

    return borrowsSource.filter((item) => {
      const haystack = [
        item.resource?.title,
        item.resource?.subject,
        item.borrowType,
        item.status,
        item.user?.firstName,
        item.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [borrowsSource, search]);

  const active = filteredBorrows.filter((item) =>
    ["active", "overdue"].includes(item.status),
  );
  const returned = filteredBorrows.filter((item) => item.status === "returned");
  const cancelled = filteredBorrows.filter(
    (item) => item.status === "cancelled",
  );
  const clearMutation = useMutation({
    mutationFn: clearBorrowHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
    },
  });

  // Calculate due date warnings
  const getDueDateWarning = (dueAt) => {
    if (!dueAt) return null;
    const dueDate = new Date(dueAt);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return { level: "overdue", message: "Overdue" };
    if (daysUntilDue <= 1) return { level: "urgent", message: "Due tomorrow" };
    if (daysUntilDue <= 3)
      return { level: "warning", message: `Due in ${daysUntilDue} days` };
    if (daysUntilDue <= 7)
      return { level: "info", message: `Due in ${daysUntilDue} days` };
    return null;
  };

  if (isLibraryOperator ? borrowsLoading : dashboardLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading borrow records...
        </div>
      </div>
    );
  }

  const screenError = isLibraryOperator ? borrowsError : dashboardError;

  if (screenError) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {screenError.message}
      </div>
    );
  }

  const title =
    user?.role === "librarian" || user?.role === "admin"
      ? "Borrow Transactions"
      : "My Borrows";
  const subtitle =
    user?.role === "librarian" || user?.role === "admin"
      ? "Review current and returned borrowing records across the library."
      : "Track your active digital access, physical loans, and returned items.";

  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
          My Library
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
        {!isLibraryOperator ? (
          <button
            onClick={() => clearMutation.mutate()}
            disabled={
              clearMutation.isPending ||
              !(returned.length || cancelled.length)
            }
            className="mt-5 rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-60 dark:border-red-900/40 dark:text-red-300"
          >
            {clearMutation.isPending
              ? "Clearing..."
              : "Clear returned and cancelled history"}
          </button>
        ) : null}
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="All Records"
          value={filteredBorrows.length}
          icon={Library}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          label="Active"
          value={active.length}
          icon={Clock3}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
        />
        <StatCard
          label="Returned"
          value={returned.length}
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
            placeholder="Search by title, subject, status, or borrower..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      <section className="space-y-4">
        {filteredBorrows.length ? (
          filteredBorrows.map((borrow) => {
            const borrowerName =
              [borrow.user?.firstName, borrow.user?.lastName]
                .filter(Boolean)
                .join(" ") || "Library member";
            const isPhysical = borrow.borrowType === "physical";
            const isOpen =
              borrow.status === "active" || borrow.status === "overdue";
            const dueWarning = getDueDateWarning(borrow.dueAt);

            return (
              <article
                key={borrow.transactionId}
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {borrow.borrowType}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                          borrow.status === "overdue"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : borrow.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {borrow.status}
                      </span>
                      {dueWarning && (
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                            dueWarning.level === "overdue"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : dueWarning.level === "urgent"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : dueWarning.level === "warning"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                          }`}
                        >
                          {dueWarning.message}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {borrow.resource?.title || "Library resource"}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {borrow.resource?.subject || "General collection"}
                      {borrow.resource?.formatType
                        ? ` | ${borrow.resource.formatType}`
                        : ""}
                    </p>
                    {(user?.role === "librarian" || user?.role === "admin") && (
                      <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {/* <UserRound size={14} /> */}
                        {borrowerName}
                      </p>
                    )}
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Borrowed {formatDate(borrow.borrowedAt)} | due{" "}
                      {formatDate(borrow.dueAt)}
                      {borrow.returnedAt
                        ? ` | returned ${formatDate(borrow.returnedAt)}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {isOpen
                        ? isPhysical
                          ? "Active physical loan"
                          : "Active digital access"
                        : "Closed record"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyPanel text="No borrow records match your current search." />
        )}
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
