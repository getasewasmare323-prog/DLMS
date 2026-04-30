import React, { useMemo, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import { useBookmarks, useResourceSearch } from "../hooks/useResources";
import { useAuth } from "../context/AuthContext";
import {
  Grid,
  Library,
  List as ListIcon,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function SearchResources() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [formatType, setFormatType] = useState("");
  const [availability, setAvailability] = useState("");
  const [resourceType, setResourceType] = useState("reading");
  const [status, setStatus] = useState("");

  const filters = useMemo(
    () => ({
      q: search,
      subject,
      gradeLevel,
      formatType,
      availability,
      resourceType,
      status,
    }),
    [availability, formatType, gradeLevel, resourceType, search, status, subject],
  );

  const { resources, error, isLoading } = useResourceSearch(filters);
  const { bookmarks = [] } = useBookmarks();
  const bookmarkIds = new Set(bookmarks.map((item) => item.resourceId));

  const subjects = [
    "",
    "English",
    "Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "History",
    "Geography",
    "Civics",
  ];
  const canReviewStatus = user?.role === "admin" || user?.role === "librarian";

  if (isLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-2 animate-spin" size={32} />
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <p className="font-medium text-red-600 dark:text-red-400">
          Error: {error?.message || "Failed to fetch resources"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600">
              Hybrid Catalog
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Catalog Search
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Search digital and physical resources, check availability, and borrow from one school catalog.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
            <button className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm dark:bg-zinc-900">
              <Grid size={18} />
            </button>
            <button className="rounded-xl p-2 text-zinc-400">
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Search by title, author, subject, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All subjects"}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          >
            <option value="">All grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <select
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={formatType}
            onChange={(e) => setFormatType(e.target.value)}
          >
            <option value="">All formats</option>
            <option value="digital">Digital</option>
            <option value="physical">Physical</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Any availability</option>
            <option value="available">Available now</option>
          </select>

          <select
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          >
            <option value="reading">Reading</option>
            <option value="video">Video</option>
          </select>

          {canReviewStatus ? (
            <select
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          ) : null}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-gradient-to-r from-emerald-50 to-cyan-50 px-5 py-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-zinc-800">
            <Library size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {resources.length} matching resources
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Borrow digital access instantly or reserve physical copies where stock is available.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <SlidersHorizontal size={16} />
          Live filters
        </button>
      </section>

      {resources.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.resourceId}
              resource={resource}
              bookmarked={bookmarkIds.has(resource.resourceId)}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No catalog records match your search right now.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSubject("");
              setGradeLevel("");
              setFormatType("");
              setAvailability("");
              setResourceType("reading");
              setStatus("");
            }}
            className="mt-2 font-semibold text-emerald-600"
          >
            Clear all filters
          </button>
        </section>
      )}
    </div>
  );
}
