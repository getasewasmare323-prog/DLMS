import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked, Loader2, Plus, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useReadingLists, useResourceSearch } from "../hooks/useResources";
import {
  addReadingListItem,
  createReadingList,
} from "../data/resourceEndpoint";

export default function ReadingLists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { readingLists = [], isLoading, error } = useReadingLists();
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    gradeLevel: user?.classLevel || "",
    visibility: "class",
  });
  const [selectedListId, setSelectedListId] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [note, setNote] = useState("");
  const canManageLists = user?.role === "teacher" || user?.role === "admin";

  const { resources = [] } = useResourceSearch(
    useMemo(
      () => ({
        q: resourceQuery,
        resourceType: "reading",
      }),
      [resourceQuery],
    ),
  );

  const createMutation = useMutation({
    mutationFn: createReadingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-lists"] });
      setCreateForm({
        title: "",
        description: "",
        gradeLevel: user?.classLevel || "",
        visibility: "class",
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ readingListId, payload }) =>
      addReadingListItem(readingListId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-lists"] });
      setResourceQuery("");
      setNote("");
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading reading lists...
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
          Guided Reading
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Reading Lists
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Browse assigned reading paths, or create and curate lists for your class.
        </p>
      </header>

      {canManageLists ? (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Create Reading List
            </h2>
            <div className="mt-5 space-y-4">
              <input
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    title: e.target.value,
                  }))
                }
                placeholder="Grade 10 Revision Shelf"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Short description"
                className="min-h-[110px] w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={createForm.gradeLevel}
                  onChange={(e) =>
                    setCreateForm((current) => ({
                      ...current,
                      gradeLevel: e.target.value,
                    }))
                  }
                  placeholder="Grade level"
                  className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <select
                  value={createForm.visibility}
                  onChange={(e) =>
                    setCreateForm((current) => ({
                      ...current,
                      visibility: e.target.value,
                    }))
                  }
                  className="rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="class">Class</option>
                  <option value="school">School</option>
                </select>
              </div>
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.title.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                <Plus size={16} />
                {createMutation.isPending ? "Creating..." : "Create list"}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Add Resource To List
            </h2>
            <div className="mt-5 space-y-4">
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Select reading list</option>
                {readingLists.map((list) => (
                  <option key={list.readingListId} value={list.readingListId}>
                    {list.title}
                  </option>
                ))}
              </select>
              <input
                value={resourceQuery}
                onChange={(e) => setResourceQuery(e.target.value)}
                placeholder="Search reading resources"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this item"
                className="min-h-[90px] w-full rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <div className="space-y-3">
                {resources.slice(0, 5).map((resource) => (
                  <div
                    key={resource.resourceId}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-700"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {resource.title}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {resource.subject || "General"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        addItemMutation.mutate({
                          readingListId: selectedListId,
                          payload: { resourceId: resource.resourceId, note },
                        })
                      }
                      disabled={addItemMutation.isPending || !selectedListId}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {readingLists.length ? (
          readingLists.map((list) => (
            <article
              key={list.readingListId}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100">
                    {list.title}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {list.description || "No description provided."}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {list.visibility}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>
                  Grade {list.gradeLevel || "All"}
                </span>
                <span>
                  {list.creator
                    ? `Curated by ${list.creator.firstName || ""} ${list.creator.lastName || ""}`.trim()
                    : "Library curated"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {(list.items || []).length ? (
                  list.items.map((item) => (
                    <div
                      key={item.readingListItemId}
                      className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <BookMarked size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.resource?.title || "Resource"}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {item.resource?.subject || "General subject"}
                          </p>
                          {item.note ? (
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                    This list does not have any items yet.
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No reading lists are available yet.
          </div>
        )}
      </section>
    </div>
  );
}
