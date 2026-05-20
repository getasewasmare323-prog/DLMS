import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Shield, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { getUserById } from "../../data/userEndPoint";

export default function AdminUserDetail() {
  const { id } = useParams();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading user details...
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
          Administration
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          User Detail
        </h1>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card icon={User} label="Name" value={[user?.firstName, user?.lastName].filter(Boolean).join(" ")} />
        <Card icon={Mail} label="Email" value={user?.email || "N/A"} />
        <Card icon={Shield} label="Role" value={user?.role || "N/A"} />
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 md:grid-cols-2">
          <Detail label="User ID" value={user?.userId || "N/A"} />
          <Detail
            label="Class Level"
            value={user?.classLevel ? `Grade ${user.classLevel}` : "Not set"}
          />
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        <Icon size={22} />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-800/70">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
