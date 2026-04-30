import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BookOpen, GraduationCap, Save, UserCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../data/userEndPoint";

const summaryCards = (user) => [
  {
    label: "Role",
    value: user?.role ? user.role.toUpperCase() : "MEMBER",
    icon: BadgeCheck,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    label: "Class Level",
    value:
      user?.role === "student"
        ? user?.classLevel
          ? `Grade ${user.classLevel}`
          : "Not set"
        : "Not required",
    icon: GraduationCap,
    tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    label: "Access",
    value: "Library Member",
    icon: BookOpen,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
];

export default function Profile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classLevel: "",
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      classLevel: user?.classLevel ?? "",
    });
  }, [user]);

  const saveProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["user"], nextUser);
      setFeedback({ type: "success", message: "Profile updated successfully." });
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error.message });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    saveProfileMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      classLevel: user?.role === "student" ? form.classLevel : null,
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <UserCircle2 size={34} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                My Profile
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                Keep your account details current across the full library system.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Member ID: {user?.userId?.slice(0, 8) || "N/A"}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {summaryCards(user).map((item) => (
          <SummaryCard key={item.label} item={item} />
        ))}
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Personal Details
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            These details are used in learning activity, resource history, and admin access records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="First Name"
              value={form.firstName}
              onChange={(value) => setForm((current) => ({ ...current, firstName: value }))}
            />
            <Field
              label="Last Name"
              value={form.lastName}
              onChange={(value) => setForm((current) => ({ ...current, lastName: value }))}
            />
            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
            <Field
              label="Role"
              value={user?.role || ""}
              disabled
            />
            {user?.role === "student" && (
              <Field
                label="Class Level"
                type="number"
                min="1"
                max="12"
                value={form.classLevel}
                onChange={(value) => setForm((current) => ({ ...current, classLevel: value }))}
              />
            )}
          </div>

          {feedback.message ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saveProfileMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {saveProfileMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}

function SummaryCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`inline-flex rounded-2xl p-3 ${item.tone}`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
        {item.label}
      </p>
      <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
        {item.value}
      </p>
    </div>
  );
}

function Field({ label, onChange, disabled = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {label}
      </span>
      <input
        {...props}
        disabled={disabled}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400"
      />
    </label>
  );
}
