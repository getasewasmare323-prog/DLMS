import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Eye,
  FileVideo,
  Loader2,
  MoreHorizontal,
  Play,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { buildAssetUrl } from "../lib/api";
import {
  deleteManagedResource,
  updateManagedResource,
} from "../data/resourceEndpoint";
import { useManagedResources } from "../hooks/useResources";

export default function TeacherVideoManagement() {
  const queryClient = useQueryClient();
  const { resources, isLoading, error } = useManagedResources();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    gradeLevel: "",
    description: "",
  });

  // Filter only video resources
  const videoResources =
    resources?.filter((resource) => resource.resourceType === "video") || [];

  const filteredVideos = videoResources.filter((video) => {
    const haystack = `${video.title || ""} ${video.subject || ""} ${
      video.gradeLevel || ""
    }`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const deleteMutation = useMutation({
    mutationFn: deleteManagedResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ resourceId, payload }) =>
      updateManagedResource(resourceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managed-resources"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setEditingVideo(null);
      toast.success("Video updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update video");
    },
  });

  const handleEdit = (video) => {
    setEditingVideo(video.resourceId);
    setEditForm({
      title: video.title || "",
      subject: video.subject || "",
      gradeLevel: video.gradeLevel || "",
      description: video.contentData?.description || "",
    });
  };

  const handleSaveEdit = (resourceId) => {
    updateMutation.mutate({
      resourceId,
      payload: editForm,
    });
  };

  const handleDelete = (video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(video.resourceId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2
            className="mx-auto mb-3 animate-spin text-emerald-600"
            size={34}
          />
          Loading your video collection...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        Error loading videos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Toaster />

      {/* Header */}
      <header className="relative overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-[linear-gradient(135deg,_#123524_0%,_#166534_50%,_#0f766e_100%)] p-8 text-white shadow-2xl shadow-emerald-950/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 left-10 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-100">
              Teacher Dashboard
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Video Management
            </h1>
            <p className="mt-4 text-sm leading-7 text-emerald-50/85 md:text-base">
              Manage your uploaded lesson videos, edit metadata, and track
              student engagement.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Total Videos" value={String(videoResources.length)} />
            <Stat
              label="Published"
              value={String(
                videoResources.filter((v) => v.status === "approved").length,
              )}
            />
          </div>
        </div>
      </header>

      {/* Search and Actions */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your videos..."
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => (window.location.href = "/upload-video")}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <Upload size={18} />
          Upload New Video
        </button>
      </section>

      {/* Videos Grid */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.resourceId}
            video={video}
            onView={() => setSelectedVideo(video)}
            onEdit={() => handleEdit(video)}
            onDelete={() => handleDelete(video)}
            isEditing={editingVideo === video.resourceId}
            editForm={editForm}
            setEditForm={setEditForm}
            onSaveEdit={() => handleSaveEdit(video.resourceId)}
            onCancelEdit={() => setEditingVideo(null)}
            isUpdating={updateMutation.isPending}
            isDeleting={
              deleteMutation.isPending &&
              deleteMutation.variables === video.resourceId
            }
          />
        ))}
      </section>

      {filteredVideos.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {searchQuery
            ? "No videos match your search."
            : "No videos uploaded yet."}
          {!searchQuery && (
            <p className="mt-2 text-sm">
              <button
                onClick={() => (window.location.href = "/upload-video")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Upload your first video lesson
              </button>
            </p>
          )}
        </div>
      )}

      {/* Video Preview Modal */}
      {selectedVideo && (
        <VideoPreviewModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-md">
    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100/80">
      {label}
    </p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

const VideoCard = ({
  video,
  onView,
  onEdit,
  onDelete,
  isEditing,
  editForm,
  setEditForm,
  onSaveEdit,
  onCancelEdit,
  isUpdating,
  isDeleting,
}) => {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Video Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-950">
        <video
          src={buildAssetUrl(video.filePath || "")}
          className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/15 to-transparent" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onView}
            className="grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 hover:scale-110"
          >
            <Play size={24} className="ml-1" fill="currentColor" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              video.status === "approved"
                ? "bg-emerald-500/90 text-white"
                : video.status === "pending"
                  ? "bg-amber-500/90 text-white"
                  : "bg-red-500/90 text-white"
            }`}
          >
            {video.status || "approved"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <EditForm
            form={editForm}
            setForm={setEditForm}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            isUpdating={isUpdating}
          />
        ) : (
          <VideoInfo
            video={video}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </article>
  );
};

const VideoInfo = ({ video, onEdit, onDelete, isDeleting }) => (
  <>
    <div className="space-y-3">
      <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100">
        {video.title}
      </h3>

      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span>{video.subject || "General"}</span>
        {video.gradeLevel && (
          <>
            <span>•</span>
            <span>Grade {video.gradeLevel}</span>
          </>
        )}
      </div>

      {video.contentData?.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {video.contentData.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Uploaded {new Date(video.createdAt).toLocaleDateString()}</span>
        <span>{video.accessLevel || "class-only"}</span>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-4 flex items-center justify-between">
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Edit3 size={14} />
        Edit
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          {isDeleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </button>
      </div>
    </div>
  </>
);

const EditForm = ({ form, setForm, onSave, onCancel, isUpdating }) => (
  <div className="space-y-4">
    <input
      value={form.title}
      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
      placeholder="Video title"
      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    />

    <div className="grid grid-cols-2 gap-3">
      <select
        value={form.subject}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, subject: e.target.value }))
        }
        className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="">Select subject</option>
        <option>Mathematics</option>
        <option>Biology</option>
        <option>Chemistry</option>
        <option>Physics</option>
        <option>English</option>
        <option>History</option>
        <option>Geography</option>
        <option>Civics</option>
      </select>

      <select
        value={form.gradeLevel}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, gradeLevel: e.target.value }))
        }
        className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        <option value="">All grades</option>
        {[9, 10, 11, 12].map((grade) => (
          <option key={grade} value={grade}>
            Grade {grade}
          </option>
        ))}
      </select>
    </div>

    <textarea
      value={form.description}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, description: e.target.value }))
      }
      placeholder="Video description"
      rows={3}
      className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    />

    <div className="flex items-center gap-3">
      <button
        onClick={onSave}
        disabled={isUpdating}
        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isUpdating ? "Saving..." : "Save Changes"}
      </button>
      <button
        onClick={onCancel}
        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Cancel
      </button>
    </div>
  </div>
);

const VideoPreviewModal = ({ video, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-xl md:p-8">
      <div className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-emerald-700"
        >
          <MoreHorizontal size={20} />
        </button>

        <div className="bg-black">
          <video
            src={buildAssetUrl(video.filePath || "")}
            controls
            autoPlay
            className="h-full max-h-[70vh] w-full bg-black object-contain lg:max-h-[92vh]"
          />
        </div>

        <aside className="flex flex-col justify-between bg-zinc-50 p-6 dark:bg-zinc-950/80 md:p-8">
          <div className="space-y-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <FileVideo size={12} />
                Lesson Video
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {video.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {video.contentData?.description ||
                  "Preview your uploaded lesson video."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetaCard label="Subject" value={video.subject || "General"} />
              <MetaCard
                label="Grade"
                value={
                  video.gradeLevel ? `Grade ${video.gradeLevel}` : "All grades"
                }
              />
              <MetaCard label="Status" value={video.status || "approved"} />
              <MetaCard
                label="Access"
                value={video.accessLevel || "class-only"}
              />
            </div>

            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Upload Details
              </p>
              <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                </p>
                {video.approvedAt && (
                  <p>
                    Approved: {new Date(video.approvedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 font-bold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              Close Preview
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const MetaCard = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {value}
    </p>
  </div>
);
