import React, { useState } from "react";
import { useVideos } from "../hooks/useResources";
import {
  AlertCircle,
  BookOpen,
  Clock,
  FileVideo,
  Loader2,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { buildAssetUrl } from "../lib/api";

export default function VideoLibrary() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { videos, error, isLoading } = useVideos();

  const filteredVideos =
    videos?.filter((vid) => {
      const haystack = `${vid.title || ""} ${vid.subject || ""}`.toLowerCase();
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
              Watch classroom explanations, revision lessons, and subject support
              videos prepared for students in your school library.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Videos" value={String(videos?.length || 0)} />
            <Stat label="For Grades" value="9 - 12" />
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
            placeholder="Search by lesson title or subject..."
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredVideos.map((vid, index) => (
          <article
            key={vid.resourceId || index}
            className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              onClick={() => setSelectedVideo(vid)}
              className="block w-full text-left"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-950">
                <video
                  src={buildAssetUrl(vid.url || vid.filePath || "")}
                  className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/15 to-transparent" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <FileVideo size={12} />
                  School Video
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
                    {vid.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {vid.subject || "General subject"}{" "}
                    {vid.gradeLevel ? `· Grade ${vid.gradeLevel}` : ""}
                  </p>
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
          </article>
        ))}
      </section>

      {!filteredVideos.length && (
        <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No video lessons match your search.
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
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

const VideoModal = ({ video, onClose }) => {
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
            src={buildAssetUrl(video.url || video.filePath || "")}
            controls
            autoPlay
            className="h-full max-h-[70vh] w-full bg-black object-contain lg:max-h-[92vh]"
          />
        </div>

        <aside className="flex flex-col justify-between bg-zinc-50 p-6 dark:bg-zinc-950/80 md:p-8">
          <div className="space-y-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Sparkles size={12} />
                School Lesson
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {video.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {video.contentData?.description ||
                  video.description ||
                  "This lesson video was uploaded to support classroom study and revision."}
              </p>
            </div>

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
                Pause after each key explanation, take short notes, and then open
                the related reading resource for deeper revision.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700">
              <BookOpen size={18} />
              Open related books
            </button>
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
};

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
