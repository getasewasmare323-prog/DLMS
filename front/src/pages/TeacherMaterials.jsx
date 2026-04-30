import React, { useState } from "react";
import ResourceCard from "../components/ResourceCard";
import { useTeacherMaterials } from "../hooks/useResources";
import {
  FileText,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function TeacherMaterials() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { materials, error, isLoading } = useTeacherMaterials();

  const categories = ["All", "Science", "Mathematics", "History", "Literature"];

  const filtered =
    materials?.filter((res) => {
      const matchesSearch = `${res.title || ""} ${res.subject || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "All" ||
        res.subject === category ||
        res.category === category;
      return matchesSearch && matchesCategory;
    }) || [];

  if (isLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-2 animate-spin" size={32} />
          <p>Loading teacher materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <p className="font-medium text-red-600 dark:text-red-400">
          Error: {error?.message || "Failed to fetch teacher materials"}
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
              Classroom Shelf
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Teacher Materials
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Open worksheets, handouts, notes, and class documents prepared by teachers.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
            <FileText size={18} className="text-emerald-600" />
            {filtered.length} records
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Search class notes, worksheets, or subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {filtered.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((res) => (
            <ResourceCard key={res.resourceId} resource={res} />
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No teacher materials match your search right now.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
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
