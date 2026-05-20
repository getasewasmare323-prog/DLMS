import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useVideos } from "../hooks/useResources";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Download,
  FileVideo,
  ListVideo,
  Loader2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { buildAssetUrl } from "../lib/api";
import { downloadStudentResource } from "../data/resourceEndpoint";
import { useAuth } from "../context/AuthContext";
import {
  getPlaylistItems,
  getPreferredVideoPath,
  getPrimaryVideoItem,
  isPlaylistVideo,
} from "../lib/videoPlaylist";

export default function VideoLibrary() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { videos, error, isLoading } = useVideos();
  const { user } = useAuth();

  const filteredVideos =
    videos?.filter((vid) => {
      const playlistTitles = getPlaylistItems(vid)
        .map((item) => item.title)
        .join(" ");
      const haystack = `${vid.title || ""} ${vid.subject || ""} ${playlistTitles}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    }) || [];

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin text-emerald-600" size={34} />
          Loading school video lessons...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={34} />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Video library unavailable
          </h3>
          <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
            The lesson videos could not be loaded right now. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-[linear-gradient(135deg,_#123524_0%,_#166534_50%,_#0f766e_100%)] p-8 text-white shadow-2xl shadow-emerald-950/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 left-10 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-100">
              Ethiopian High School Media
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Video Lessons
            </h1>
            <p className="mt-4 text-sm leading-7 text-emerald-50/85 md:text-base">
              Watch classroom explanations, revision lessons, and full lesson
              playlists prepared for students in your school library.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Videos" value={String(videos?.length || 0)} />
            <Stat
              label="Playlists"
              value={String((videos || []).filter((video) => isPlaylistVideo(video)).length)}
            />
          </div>
        </div>
      </header>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-5">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by lesson title, subject, or playlist lesson..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.resourceId}
            video={video}
            isStudent={user?.role === "student"}
            onOpen={() => setSelectedVideo(video)}
          />
        ))}
      </section>

      {!filteredVideos.length && (
        <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No video lessons match your search.
        </div>
      )}

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          isStudent={user?.role === "student"}
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

function VideoCard({ video, isStudent, onOpen }) {
  const playlistItems = getPlaylistItems(video);
  const primaryItem = getPrimaryVideoItem(video);
  const previewPath = getPreferredVideoPath(video);

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-video overflow-hidden bg-zinc-950">
          <video
            src={buildAssetUrl(previewPath)}
            className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/15 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <FileVideo size={12} />
              School Video
            </div>
            {playlistItems.length ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-300/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <ListVideo size={12} />
                {playlistItems.length} lessons
              </div>
            ) : null}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play size={24} className="ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100">
              {video.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {video.subject || "General subject"}
              {video.gradeLevel ? ` · Grade ${video.gradeLevel}` : ""}
            </p>
            {playlistItems.length ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Starts with {primaryItem?.title || "Lesson 1"}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Teacher verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-500" />
              Ready now
            </span>
          </div>
        </div>
      </button>

      {isStudent ? (
        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <VideoDownloadButton
            video={video}
            item={primaryItem}
            label={
              playlistItems.length ? "Download first lesson" : "Download lesson video"
            }
          />
        </div>
      ) : null}
    </article>
  );
}

function VideoModal({ video, onClose, isStudent = false }) {
  const playlistItems = getPlaylistItems(video);
  const [selectedItemId, setSelectedItemId] = useState(
    playlistItems[0]?.itemId || null,
  );

  useEffect(() => {
    setSelectedItemId(playlistItems[0]?.itemId || null);
  }, [video.resourceId]);

  const activeItem =
    playlistItems.find((item) => item.itemId === selectedItemId) ||
    playlistItems[0] ||
    null;
  const activeVideoPath = getPreferredVideoPath(video, activeItem?.itemId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-xl md:p-8">
      <div className="relative grid max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-zinc-900 lg:grid-cols-[1.3fr_0.7fr]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-emerald-700"
        >
          <X size={20} />
        </button>

        <div className="bg-black">
          <video
            key={`${video.resourceId}-${activeItem?.itemId || "single"}`}
            src={buildAssetUrl(activeVideoPath)}
            controls
            autoPlay
            className="h-full max-h-[70vh] w-full bg-black object-contain lg:max-h-[92vh]"
          />
        </div>

        <aside className="flex flex-col justify-between bg-zinc-50 p-6 dark:bg-zinc-950/80 md:p-8">
          <div className="space-y-6 overflow-y-auto">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Sparkles size={12} />
                {playlistItems.length ? "Lesson Playlist" : "School Lesson"}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {video.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {playlistItems.length
                  ? activeItem?.description ||
                    video.contentData?.description ||
                    video.description ||
                    "This playlist groups connected lesson videos into one study path."
                  : video.contentData?.description ||
                    video.description ||
                    "This lesson video was uploaded to support classroom study and revision."}
              </p>
            </div>

            {playlistItems.length ? (
              <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Playlist
                </p>
                <div className="mt-4 space-y-2">
                  {playlistItems.map((item, index) => (
                    <button
                      key={item.itemId}
                      onClick={() => setSelectedItemId(item.itemId)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                        item.itemId === activeItem?.itemId
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
                        Lesson {index + 1}
                      </p>
                      <p className="mt-1 font-semibold">{item.title}</p>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <MetaCard label="Subject" value={video.subject || "General"} />
              <MetaCard
                label="Grade"
                value={video.gradeLevel ? `Grade ${video.gradeLevel}` : "All grades"}
              />
            </div>

            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Study Tip
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {playlistItems.length
                  ? "Finish each lesson in order, pause to note the key idea, and then move to the next item only after reviewing your notes."
                  : "Pause after each key explanation, take short notes, and then open the related reading resource for deeper revision."}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700">
              <BookOpen size={18} />
              Open related books
            </button>
            {isStudent ? (
              <VideoDownloadButton
                video={video}
                item={activeItem}
                label={
                  playlistItems.length ? "Download current lesson" : "Download lesson video"
                }
                fullWidth
              />
            ) : null}
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 font-bold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              Close player
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function VideoDownloadButton({ video, item = null, label, fullWidth = false }) {
  const downloadMutation = useMutation({
    mutationFn: () =>
      downloadStudentResource(
        video.resourceId,
        `${item?.title || video.title || "video"}.mp4`,
        item?.itemId ? { itemId: item.itemId } : {},
      ),
  });

  return (
    <button
      onClick={() => downloadMutation.mutate()}
      disabled={downloadMutation.isPending}
      className={`flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 font-bold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 ${
        fullWidth ? "w-full" : "w-full"
      }`}
    >
      <Download size={18} />
      {downloadMutation.isPending ? "Preparing download..." : label}
    </button>
  );
}

const MetaCard = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
      {label}
    </p>
    <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
      {value}
    </p>
  </div>
);
