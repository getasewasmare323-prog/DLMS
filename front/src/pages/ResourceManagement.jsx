import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Library,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import {
  deleteManagedResource,
  registerPhysicalResource,
  updateManagedResource,
} from "../data/resourceEndpoint";
import { useAuth } from "../context/AuthContext";
import { useManagedResources, useOverdueBorrows } from "../hooks/useResources";

export default function ResourceManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { resources, isLoading, error } = useManagedResources();
  const { overdueBorrows = [] } = useOverdueBorrows();
  const [drafts, setDrafts] = useState({});
  const [physicalForm, setPhysicalForm] = useState({
    title: "",
    author: "",
    subject: "English",
    gradeLevel: "",
    totalCopies: 1,
    shelfLocation: "",
    description: "",
  });

  const deleteMutation = useMutation({
    mutationFn: deleteManagedResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource-search"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ resourceId, payload }) => updateManagedResource(resourceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource-search"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerPhysicalResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource-search"] });
      setPhysicalForm({
        title: "",
        author: "",
        subject: "English",
        gradeLevel: "",
        totalCopies: 1,
        shelfLocation: "",
        description: "",
      });
    },
  });

  const isTeacher = user?.role === "teacher";
  const pageTitle = isTeacher ? "My Shelf Records" : "Operations Desk";

  const subjectOptions = useMemo(
    () => ["English", "Mathematics", "Biology", "Chemistry", "Physics", "History"],
    [],
  );

  const setDraftValue = (resourceId, field, value, resource) => {
    setDrafts((current) => ({
      ...current,
      [resourceId]: {
        title: current[resourceId]?.title ?? resource.title ?? "",
        subject: current[resourceId]?.subject ?? resource.subject ?? "",
        gradeLevel: current[resourceId]?.gradeLevel ?? resource.gradeLevel ?? "",
        status: current[resourceId]?.status ?? resource.status ?? "approved",
        availableCopies:
          current[resourceId]?.availableCopies ?? resource.availableCopies ?? 0,
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading catalog records...
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
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
          Catalog Management
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {pageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          {isTeacher
            ? "Edit your uploaded teaching materials and watch approval status."
            : "Review catalog status, physical stock, and overdue circulation in one place."}
        </p>
      </header>

      {!isTeacher ? (
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Library size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Register Physical Resource
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Add print-only or hybrid items with tracked copy counts.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={physicalForm.title}
                onChange={(e) =>
                  setPhysicalForm((current) => ({ ...current, title: e.target.value }))
                }
                placeholder="Book title"
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                value={physicalForm.author}
                onChange={(e) =>
                  setPhysicalForm((current) => ({ ...current, author: e.target.value }))
                }
                placeholder="Author"
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <select
                value={physicalForm.subject}
                onChange={(e) =>
                  setPhysicalForm((current) => ({ ...current, subject: e.target.value }))
                }
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={physicalForm.totalCopies}
                onChange={(e) =>
                  setPhysicalForm((current) => ({
                    ...current,
                    totalCopies: Number(e.target.value),
                  }))
                }
                placeholder="Copies"
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                value={physicalForm.gradeLevel}
                onChange={(e) =>
                  setPhysicalForm((current) => ({ ...current, gradeLevel: e.target.value }))
                }
                placeholder="Grade level"
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                value={physicalForm.shelfLocation}
                onChange={(e) =>
                  setPhysicalForm((current) => ({
                    ...current,
                    shelfLocation: e.target.value,
                  }))
                }
                placeholder="Shelf location"
                className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <textarea
                value={physicalForm.description}
                onChange={(e) =>
                  setPhysicalForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Description"
                className="md:col-span-2 min-h-[110px] rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <button
              onClick={() =>
                registerMutation.mutate({
                  ...physicalForm,
                  resourceType: "reading",
                })
              }
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
          >
            <Library size={16} />
            Register physical copies
          </button>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Overdue Circulation
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Borrowers whose due dates have passed.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {overdueBorrows.length ? (
                overdueBorrows.slice(0, 5).map((borrow) => (
                  <div
                    key={borrow.transactionId}
                    className="rounded-2xl bg-zinc-50 px-4 py-4 dark:bg-zinc-800/70"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {borrow.resource?.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {borrow.user?.firstName} {borrow.user?.lastName} | due{" "}
                      {borrow.dueAt
                        ? new Date(borrow.dueAt).toLocaleDateString()
                        : "unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                  No overdue borrow records right now.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5">
        {resources.map((resource) => {
          const draft = drafts[resource.resourceId] || {};
          const nextTitle = draft.title ?? resource.title ?? "";
          const nextSubject = draft.subject ?? resource.subject ?? "";
          const nextGrade = draft.gradeLevel ?? resource.gradeLevel ?? "";
          const nextStatus = draft.status ?? resource.status ?? "approved";
          const nextAvailable =
            draft.availableCopies ?? resource.availableCopies ?? 0;

          return (
            <article
              key={resource.resourceId}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {resource.resourceType === "video" ? (
                      <Library size={20} />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {resource.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {resource.subject || "General collection"}
                      {resource.gradeLevel ? ` | Grade ${resource.gradeLevel}` : " | Open shelf"}
                      {resource.formatType ? ` | ${resource.formatType}` : ""}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-zinc-400">
                      Cataloged by {resource.user?.firstName || "User"} {resource.user?.lastName || ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {resource.status || "approved"}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {resource.availableCopies || 0}/{resource.totalCopies || 0} copies
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={nextTitle}
                  onChange={(e) =>
                    setDraftValue(resource.resourceId, "title", e.target.value, resource)
                  }
                  className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <input
                  value={nextSubject}
                  onChange={(e) =>
                    setDraftValue(resource.resourceId, "subject", e.target.value, resource)
                  }
                  className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <input
                  value={nextGrade}
                  onChange={(e) =>
                    setDraftValue(resource.resourceId, "gradeLevel", e.target.value, resource)
                  }
                  className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {!isTeacher ? (
                  <select
                    value={nextStatus}
                    onChange={(e) =>
                      setDraftValue(resource.resourceId, "status", e.target.value, resource)
                    }
                    className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="approved">approved</option>
                    <option value="pending">pending</option>
                    <option value="rejected">rejected</option>
                    <option value="archived">archived</option>
                  </select>
                ) : null}
              </div>

              {!isTeacher ? (
                <div className="mt-3 max-w-xs">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Available copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nextAvailable}
                    onChange={(e) =>
                      setDraftValue(
                        resource.resourceId,
                        "availableCopies",
                        e.target.value,
                        resource,
                      )
                    }
                    className="w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      resourceId: resource.resourceId,
                      payload: {
                        title: nextTitle,
                        subject: nextSubject,
                        gradeLevel: nextGrade,
                        status: nextStatus,
                        availableCopies: nextAvailable,
                      },
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Save size={16} />
                  Save changes
                </button>

                <button
                  onClick={() => deleteMutation.mutate(resource.resourceId)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
