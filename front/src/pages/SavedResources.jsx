import React, { useMemo, useState } from "react";
import { Bookmark, ExternalLink, Loader2, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buildAssetUrl } from "../lib/api";
import { useLearningDashboard } from "../hooks/useResources";

export default function SavedResources() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const {
    dashboard,
    isLoading,
    error,
  } = useLearningDashboard();
  const bookmarks = dashboard?.bookmarks || [];

  const safeBookmarks = useMemo(
    () => bookmarks.filter((item) => item?.resource),
    [bookmarks],
  );

  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return safeBookmarks;

    return safeBookmarks.filter((item) => {
      const resource = item.resource || {};
      const haystack = [
        resource.title,
        resource.subject,
        resource.author,
        resource.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [safeBookmarks, search]);

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading saved resources...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error?.message}
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
          Saved Resources
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Revisit your bookmarked catalog records and track the reading lists you are building.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Bookmarks"
          value={filteredBookmarks.length}
          icon={Bookmark}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          label="Study Shelf"
          value={safeBookmarks.length}
          icon={Sparkles}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <StatCard
          label="Ready To Revisit"
          value={filteredBookmarks.length}
          icon={Bookmark}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
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
            placeholder="Search saved titles, subjects, or authors..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Bookmark Shelf
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Keep the resources you want to revisit together in one place.
            </p>
          </div>
          <button
            onClick={() => navigate("/catalog")}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Browse catalog
          </button>
        </div>
      </section>

      {filteredBookmarks.length ? (
        <section className="space-y-4">
          {filteredBookmarks.map((bookmark) => {
            const resource = bookmark.resource;

            return (
              <article
                key={bookmark.bookmarkId}
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        bookmarked
                      </span>
                      {resource?.resourceType ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {resource.resourceType}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      {resource?.title || "Saved library resource"}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {resource?.author || "Library record"}
                      {resource?.subject ? ` | ${resource.subject}` : ""}
                      {resource?.gradeLevel ? ` | Grade ${resource.gradeLevel}` : ""}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {resource?.description || "Saved from your school catalog for quick access."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/catalog/${resource?.resourceId}`)}
                      className="rounded-2xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      View details
                    </button>
                    {resource?.filePath ? (
                      <button
                        onClick={() => window.open(buildAssetUrl(resource.filePath), "_blank")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        <ExternalLink size={15} />
                        Open file
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyPanel text="No saved resources match your current search." />
      )}
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
