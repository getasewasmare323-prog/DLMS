import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Clock,
  Save,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { updateReadingProgress } from "../data/resourceEndpoint";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SecureReader() {
  const location = useLocation();
  const { title, url: fileUrl, resourceId } = location.state || {};
  const readerRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageWidth, setPageWidth] = useState(760);
  const [readingStartTime, setReadingStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState("");
  const [lastSavedProgress, setLastSavedProgress] = useState(0);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
  };

  useEffect(() => {
    const preventActions = (e) => {
      if (e.type === "contextmenu") e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventActions);
    window.addEventListener("keydown", preventActions);

    return () => {
      document.removeEventListener("contextmenu", preventActions);
      window.removeEventListener("keydown", preventActions);
    };
  }, []);

  const saveProgressMutation = useMutation({
    mutationFn: (progressData) =>
      updateReadingProgress(resourceId, progressData),
    onSuccess: () => {
      setLastSavedProgress(pageNumber);
    },
  });

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - readingStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [readingStartTime]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!resourceId || !numPages) return;

    const autoSave = () => {
      const progressPercent = Math.round((pageNumber / numPages) * 100);
      saveProgressMutation.mutate({
        progressPercent,
        lastPage: pageNumber,
        totalPages: numPages,
        timeSpent,
        bookmarks,
        notes,
      });
    };

    // Set up auto-save every 30 seconds
    const interval = setInterval(autoSave, 30000);

    return () => clearInterval(interval);
  }, [resourceId, numPages, saveProgressMutation]);

  // Save progress when page changes significantly
  useEffect(() => {
    if (
      !resourceId ||
      !numPages ||
      Math.abs(pageNumber - lastSavedProgress) < 5
    )
      return;

    const progressPercent = Math.round((pageNumber / numPages) * 100);
    saveProgressMutation.mutate({
      progressPercent,
      lastPage: pageNumber,
      totalPages: numPages,
      timeSpent,
      bookmarks,
      notes,
    });
  }, [
    pageNumber,
    lastSavedProgress,
    numPages,
    timeSpent,
    bookmarks,
    notes,
    resourceId,
    saveProgressMutation,
  ]);

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const exists = prev.includes(pageNumber);
      if (exists) {
        return prev.filter((p) => p !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const displayTitle = title || "School Reading Material";

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-[radial-gradient(circle_at_top,_rgba(21,128,61,0.18),_transparent_28%),linear-gradient(180deg,_#f5f6f7_0%,_#eef2f1_100%)] shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid min-h-[88vh] xl:grid-cols-[300px_1fr]">
        <aside className="border-b border-zinc-200/80 bg-white/85 p-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/85 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/25">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-600">
                Secure Reading
              </p>
              <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Reader Desk
              </h2>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {displayTitle}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Protected school copy for in-app reading only.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-zinc-900 dark:text-emerald-300">
                <ShieldCheck size={13} />
                Preview Protected
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Reading Controls
              </p>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() =>
                    setZoom((current) => Math.max(0.75, current - 0.1))
                  }
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Zoom
                  </p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {Math.round(zoom * 100)}%
                  </p>
                </div>
                <button
                  onClick={() =>
                    setZoom((current) => Math.min(1.8, current + 0.1))
                  }
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="mt-6 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Page progress
                </p>
                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {pageNumber}
                  <span className="text-base text-zinc-400">
                    {" "}
                    / {numPages || "--"}
                  </span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Clock size={14} className="text-emerald-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatTime(timeSpent)}
                  </span>
                </div>
                {saveProgressMutation.isPending && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 size={12} className="animate-spin" />
                    Saving progress...
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={toggleBookmark}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    bookmarks.includes(pageNumber)
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {bookmarks.includes(pageNumber) ? (
                      <BookmarkCheck size={14} />
                    ) : (
                      <Bookmark size={14} />
                    )}
                    {bookmarks.includes(pageNumber) ? "Bookmarked" : "Bookmark"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    saveProgressMutation.mutate({
                      progressPercent: Math.round(
                        (pageNumber / numPages) * 100,
                      ),
                      lastPage: pageNumber,
                      totalPages: numPages,
                      timeSpent,
                      bookmarks,
                      notes,
                    })
                  }
                  disabled={saveProgressMutation.isPending}
                  className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save size={14} />
                    Save
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Reading Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your reading notes here..."
                className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                rows={4}
              />
            </div>

            {bookmarks.length > 0 && (
              <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Bookmarks ({bookmarks.length})
                </p>
                <div className="mt-3 space-y-2">
                  {bookmarks.map((page) => (
                    <button
                      key={page}
                      onClick={() => setPageNumber(page)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        page === pageNumber
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      Page {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="relative flex min-h-[70vh] flex-col">
          <div className="flex items-center justify-between border-b border-zinc-200/70 bg-white/80 px-5 py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/75 md:px-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
                Ethiopian High School Library
              </p>
              <h1 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100 md:text-2xl">
                {displayTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() =>
                  setPageNumber((current) => Math.max(1, current - 1))
                }
                className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={pageNumber >= numPages}
                onClick={() =>
                  setPageNumber((current) =>
                    Math.min(numPages || current, current + 1),
                  )
                }
                className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={readerRef}
            className="relative flex-1 overflow-auto p-4 md:p-6 xl:p-10"
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
              <div className="flex h-full w-full flex-wrap content-start gap-x-20 gap-y-24 p-12 -rotate-12">
                {Array.from({ length: 50 }).map((_, index) => (
                  <span
                    key={index}
                    className="text-xs font-black uppercase tracking-[0.32em] text-zinc-900 dark:text-white"
                  >
                    Ethiopian School Library
                  </span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mx-auto flex w-full justify-center">
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                    <Loader2
                      className="animate-spin text-emerald-600"
                      size={34}
                    />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      Opening protected reader...
                    </p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.round(pageWidth * zoom)}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                />
              </Document>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
