import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  ExternalLink,
  Library,
  Loader2,
  ListVideo,
  MapPin,
  PlayCircle,
  Tag,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { buildAssetUrl } from "../lib/api";
import { useResource } from "../hooks/useResources";
import {
  addBookmark,
  borrowPhysicalResource,
  removeBookmark,
  createReservation,
} from "../data/resourceEndpoint";
import { useBookmarks } from "../hooks/useResources";
import {
  getPlaylistItems,
  getPreferredVideoPath,
  getPrimaryVideoItem,
  isPlaylistVideo,
} from "../lib/videoPlaylist";

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { resource, isLoading, error } = useResource(id);
  const { bookmarks = [] } = useBookmarks();
  const bookmarked = bookmarks.some((item) => item.resourceId === id);
  const canBookmark = user?.role === "teacher" || user?.role === "student";

  const invalidateLibraryQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["resource", id] });
    queryClient.invalidateQueries({ queryKey: ["resource-search"] });
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    queryClient.invalidateQueries({ queryKey: ["borrows"] });
    queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
  };

  const bookmarkMutation = useMutation({
    mutationFn: () => (bookmarked ? removeBookmark(id) : addBookmark(id)),
    onSuccess: invalidateLibraryQueries,
  });

  const physicalBorrowMutation = useMutation({
    mutationFn: () => borrowPhysicalResource(id),
    onSuccess: invalidateLibraryQueries,
  });

  const reserveMutation = useMutation({
    mutationFn: () => createReservation(id),
    onSuccess: invalidateLibraryQueries,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading catalog record...
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error?.message || "Resource not found"}
      </div>
    );
  }

  const contentData = resource.contentData || {};
  const playlistItems = getPlaylistItems(resource);
  const primaryVideoItem = getPrimaryVideoItem(resource);
  const canOpenReader =
    resource.resourceType === "reading" &&
    resource.formatType !== "physical" &&
    resource.filePath;
  const canWatchVideo =
    resource.resourceType === "video" &&
    (!!resource.filePath || playlistItems.length > 0);
  const canBorrowPhysical =
    resource.formatType !== "digital" && (resource.availableCopies || 0) > 0;
  const keywords = Array.isArray(resource.keywords) ? resource.keywords : [];
  const uploaderName =
    [resource.user?.firstName, resource.user?.lastName]
      .filter(Boolean)
      .join(" ") || "School staff";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to catalog
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {canBookmark && (
            <button
              onClick={() => bookmarkMutation.mutate()}
              className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 transition-colors hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {bookmarked ? (
                <BookmarkCheck size={18} />
              ) : (
                <Bookmark size={18} />
              )}
            </button>
          )}
          {resource.filePath ? (
            <button
              onClick={() =>
                window.open(
                  buildAssetUrl(getPreferredVideoPath(resource)),
                  "_blank",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <ExternalLink size={16} />
              {isPlaylistVideo(resource) ? "Open first lesson" : "Open file"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{resource.resourceType}</Badge>
            <Badge>{resource.formatType || "digital"}</Badge>
            {resource.status ? <Badge>{resource.status}</Badge> : null}
            {resource.gradeLevel ? (
              <Badge>{`Grade ${resource.gradeLevel}`}</Badge>
            ) : null}
          </div>

          <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {resource.title}
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            {resource.author || "Catalog record"}
          </p>

          <p className="mt-6 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            {resource.description ||
              "This catalog record is available through the school digital library system."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <MetaRow icon={User} label="Cataloged by" value={uploaderName} />
            <MetaRow
              icon={Calendar}
              label="Added"
              value={formatDate(resource.createdAt)}
            />
            <MetaRow
              icon={Tag}
              label="Subject"
              value={resource.subject || "General"}
            />
            <MetaRow
              icon={Library}
              label="Availability"
              value={getAvailabilityText(resource)}
            />
            {resource.shelfLocation ? (
              <MetaRow
                icon={MapPin}
                label="Shelf Location"
                value={resource.shelfLocation}
              />
            ) : null}
            {contentData.language ? (
              <MetaRow
                icon={BookOpen}
                label="Language"
                value={contentData.language}
              />
            ) : null}
          </div>

          {keywords.length ? (
            <div className="mt-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Keywords
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywords.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {canOpenReader ? (
              <button
                onClick={() =>
                  navigate("/reader", {
                    state: {
                      title: resource.title,
                      url: buildAssetUrl(resource.filePath),
                      resourceId: resource.resourceId,
                    },
                  })
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <BookOpen size={16} />
                Open Reader
              </button>
            ) : null}
            {canWatchVideo ? (
              <button
                onClick={() => {
                  const targetPath = getPreferredVideoPath(resource);
                  if (targetPath) {
                    window.open(buildAssetUrl(targetPath), "_blank");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700"
              >
                <PlayCircle size={16} />
                {isPlaylistVideo(resource) ? "Watch Playlist" : "Watch Video"}
              </button>
            ) : null}
            {canBorrowPhysical ? (
              <button
                onClick={() => physicalBorrowMutation.mutate()}
                disabled={physicalBorrowMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Library size={16} />
                Physical Borrow
              </button>
            ) : resource.formatType !== "digital" ? (
              <button
                onClick={() => reserveMutation.mutate()}
                disabled={reserveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-5 py-3 text-sm font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-950/20"
              >
                <Clock size={16} />
                Reserve Item
              </button>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <MetadataCard
            title="Catalog Metadata"
            items={[
              { label: "Publisher", value: contentData.publisher },
              { label: "Edition", value: contentData.edition },
              { label: "ISBN / Catalog No.", value: contentData.isbn },
              { label: "Document Type", value: contentData.documentType },
              {
                label: "Resource Category",
                value: contentData.resourceCategory,
              },
              { label: "Access Level", value: resource.accessLevel },
            ]}
          />

          <MetadataCard
            title="Collection Notes"
            items={[
              { label: "Total Copies", value: resource.totalCopies },
              { label: "Available Copies", value: resource.availableCopies },
              { label: "Approved At", value: formatDate(resource.approvedAt) },
              { label: "Review Note", value: resource.reviewNote },
            ]}
          />

          {canWatchVideo ? (
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {isPlaylistVideo(resource) ? "Video Playlist" : "Video Preview"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {isPlaylistVideo(resource)
                      ? `${playlistItems.length} lessons in sequence`
                      : "Open the lesson directly from this catalog record"}
                  </p>
                </div>
                {isPlaylistVideo(resource) ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
                    <ListVideo size={14} />
                    Starts with {primaryVideoItem?.title || "Lesson 1"}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                {playlistItems.length ? (
                  playlistItems.map((item, index) => (
                    <button
                      key={item.itemId}
                      onClick={() =>
                        window.open(
                          buildAssetUrl(getPreferredVideoPath(resource, item.itemId)),
                          "_blank",
                        )
                      }
                      className="flex w-full items-start justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
                    >
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                          Lesson {index + 1}
                        </p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <PlayCircle size={18} className="mt-1 shrink-0" />
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() =>
                      window.open(buildAssetUrl(getPreferredVideoPath(resource)), "_blank")
                    }
                    className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Open lesson file
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Launch the uploaded video in a new tab.
                      </p>
                    </div>
                    <PlayCircle size={18} className="shrink-0" />
                  </button>
                )}
              </div>
            </section>
          ) : null}

          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/20">
            <h3 className="text-lg font-bold">Library Use Tip</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-50/90">
              Use the metadata on this page to verify edition, shelf location,
              and access scope before borrowing or assigning this resource.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white p-2 text-emerald-600 dark:bg-zinc-900">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            {label}
          </p>
          <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {value || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetadataCard({ title, items }) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <div className="mt-4 space-y-3">
        {items
          .filter(
            (item) =>
              item.value !== null &&
              item.value !== undefined &&
              item.value !== "",
          )
          .map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-4 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
            >
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {item.label}
              </span>
              <span className="text-right text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {String(item.value)}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </span>
  );
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

function getAvailabilityText(resource) {
  if (resource.formatType === "digital") return "Digital access available";
  if (resource.formatType === "hybrid") {
    return `${resource.availableCopies || 0} physical copies plus digital access`;
  }
  return `${resource.availableCopies || 0} physical copies available`;
}
