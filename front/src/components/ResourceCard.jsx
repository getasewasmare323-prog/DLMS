import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Clock,
  Download,
  Library,
  PlayCircle,
  Tag,
  User,
} from "lucide-react";
import { buildAssetUrl } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addBookmark,
  borrowPhysicalResource,
  removeBookmark,
  createReservation,
} from "../data/resourceEndpoint";

const subjectToneMap = {
  Biology: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  Chemistry: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  Physics:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  Mathematics:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  English: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function ResourceCard({
  resource,
  bookmarked = false,
  onOpenReader,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const resourceKind = resource.resourceType || "reading";
  const uploaderName =
    [resource?.user?.firstName, resource?.user?.lastName]
      .filter(Boolean)
      .join(" ") || "School staff";
  const publishedDate = resource?.createdAt
    ? new Date(resource.createdAt).toLocaleDateString()
    : "Recent";
  const canOpenReader =
    resource.formatType !== "physical" && resource.resourceType === "reading";
  const canBorrowPhysical =
    resource.formatType !== "digital" && (resource.availableCopies || 0) > 0;
  const isPending = resource.status === "pending";
  const canBookmark = user?.role === "teacher" || user?.role === "student";

  const invalidateLibraryQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["books"] });
    queryClient.invalidateQueries({ queryKey: ["textbooks"] });
    queryClient.invalidateQueries({ queryKey: ["teacher-materials"] });
    queryClient.invalidateQueries({ queryKey: ["resource-search"] });
    queryClient.invalidateQueries({ queryKey: ["borrows"] });
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
  };

  const bookmarkMutation = useMutation({
    mutationFn: () =>
      bookmarked
        ? removeBookmark(resource.resourceId)
        : addBookmark(resource.resourceId),
    onSuccess: invalidateLibraryQueries,
  });

  const physicalBorrowMutation = useMutation({
    mutationFn: () => borrowPhysicalResource(resource.resourceId),
    onSuccess: invalidateLibraryQueries,
  });

  const reserveMutation = useMutation({
    mutationFn: () => createReservation(resource.resourceId),
    onSuccess: invalidateLibraryQueries,
  });

  const openReader = (event) => {
    event.preventDefault();
    if (typeof onOpenReader === "function") {
      onOpenReader(resource);
      return;
    }

    if (!resource.filePath) {
      return;
    }

    navigate("/reader", {
      state: {
        title: resource.title,
        url: buildAssetUrl(resource.filePath),
        resourceId: resource.resourceId,
      },
    });
  };

  const badgeClass =
    subjectToneMap[resource.subject] ||
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-100/70 blur-2xl dark:bg-emerald-900/20" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-2xl ${
              resourceKind === "video"
                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            }`}
          >
            {resourceKind === "video" ? (
              <PlayCircle size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </span>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isPending ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Pending
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}
            >
              {resource.subject || "General"}
            </span>
          </div>
        </div>

        <h3 className="line-clamp-2 text-lg font-bold text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-300">
          {resource.title}
        </h3>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {resource.author || "Library record"}
          {resource.gradeLevel
            ? ` | Grade ${resource.gradeLevel}`
            : " | Open shelf"}
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {resource.description ||
            resource.contentData?.documentType ||
            resource.contentData?.resourceCategory ||
            "Catalog record ready for library use."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.15em]">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {resource.formatType || "digital"}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {resource.resourceType}
          </span>
          {resource.formatType !== "digital" ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {resource.availableCopies || 0} copies
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-300">
          <p className="flex items-center gap-1.5 truncate">
            <User size={13} className="text-emerald-500" />
            <span className="truncate">Cataloged by {uploaderName}</span>
          </p>
          <p className="flex items-center justify-end gap-1.5">
            <Clock size={13} className="text-emerald-500" />
            {publishedDate}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex gap-2">
            {canOpenReader ? (
              <button
                onClick={openReader}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={15} />
                  Open Reader
                </span>
              </button>
            ) : (
              <button
                disabled
                className="flex-1 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              >
                Reader Unavailable
              </button>
            )}

            {canBookmark && (
              <button
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className="rounded-xl border border-zinc-200 bg-white px-3 text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                aria-label="Save Resource"
              >
                {bookmarked ? (
                  <BookmarkCheck size={17} />
                ) : (
                  <Bookmark size={17} />
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => navigate(`/catalog/${resource.resourceId}`)}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              View Details
            </button>
            {canBorrowPhysical ? (
              <button
                onClick={() => physicalBorrowMutation.mutate()}
                disabled={physicalBorrowMutation.isPending}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span className="inline-flex items-center gap-2">
                  <Library size={14} />
                  Physical Borrow
                </span>
              </button>
            ) : resource.formatType !== "digital" ? (
              <button
                onClick={() => reserveMutation.mutate()}
                disabled={reserveMutation.isPending}
                className="rounded-xl border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-950/20"
              >
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} />
                  Reserve
                </span>
              </button>
            ) : null}
          </div>
        </div>

        {resource.filePath && user ? (
          <button
            onClick={() =>
              window.open(buildAssetUrl(resource.filePath), "_blank")
            }
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400"
          >
            <Download size={14} />
            Open file directly
          </button>
        ) : null}
      </div>
    </article>
  );
}
