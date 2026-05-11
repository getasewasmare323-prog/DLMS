import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Loader2,
  Search,
  Trash2,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMyReservations, useMyBorrows } from "../hooks/useResources";
import { cancelReservation } from "../data/resourceEndpoint";

export default function MyReservations() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { reservations = [], isLoading, error } = useMyReservations();
  const { borrows = [] } = useMyBorrows();

  const cancelMutation = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
    },
  });

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reservations;

    return reservations.filter((reservation) => {
      const haystack = [
        reservation.resource?.title,
        reservation.resource?.subject,
        reservation.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [reservations, search]);

  // Check if user has active borrows for reserved resources
  const hasActiveBorrow = (resourceId) => {
    return borrows.some(
      (borrow) =>
        borrow.resourceId === resourceId &&
        ["active", "overdue"].includes(borrow.status),
    );
  };

  const activeReservations = filteredReservations.filter(
    (r) => r.status === "active",
  );
  const expiredReservations = filteredReservations.filter(
    (r) => r.status === "expired",
  );
  const cancelledReservations = filteredReservations.filter(
    (r) => r.status === "cancelled",
  );

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading reservations...
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
          My Library
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          My Reservations
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Reserve items that are currently unavailable and get notified when
          they become available.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Active"
          value={activeReservations.length}
          icon={Clock}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
        />
        <StatCard
          label="Expired"
          value={expiredReservations.length}
          icon={AlertCircle}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <StatCard
          label="Cancelled"
          value={cancelledReservations.length}
          icon={Trash2}
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
            placeholder="Search reservations by title or subject..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      <section className="space-y-4">
        {filteredReservations.length ? (
          filteredReservations.map((reservation) => {
            const isActive = reservation.status === "active";
            const isExpired = reservation.status === "expired";
            const hasBorrow = hasActiveBorrow(reservation.resourceId);
            const canCancel = isActive && !hasBorrow;

            return (
              <article
                key={reservation.reservationId}
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                          isActive
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                            : isExpired
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {reservation.status}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Queue #{reservation.queuePosition}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {reservation.resource?.title || "Library resource"}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {reservation.resource?.subject || "General collection"}
                      {reservation.resource?.formatType
                        ? ` | ${reservation.resource.formatType}`
                        : ""}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <p className="flex items-center gap-2">
                        <Calendar size={14} />
                        Reserved {formatDate(reservation.reservedAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={14} />
                        Expires {formatDate(reservation.expiresAt)}
                      </p>
                    </div>
                    {hasBorrow && (
                      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        You currently have this item borrowed
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {canCancel && (
                      <button
                        onClick={() =>
                          cancelMutation.mutate(reservation.reservationId)
                        }
                        disabled={cancelMutation.isPending}
                        className="rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-950/20"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 size={15} />
                          Cancel
                        </span>
                      </button>
                    )}
                    <span className="rounded-2xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {isActive
                        ? "Waiting in queue"
                        : isExpired
                          ? "Reservation expired"
                          : "Reservation cancelled"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <EmptyPanel text="No reservations match your current search." />
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
