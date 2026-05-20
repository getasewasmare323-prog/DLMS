import React, { useState } from "react";
import { AlertCircle, ListVideo, Plus, Trash2, Upload, Video } from "lucide-react";
import { uploadVideo } from "../data/resourceEndpoint";

const gradeOptions = [9, 10, 11, 12];

function createPlaylistEntry() {
  return {
    title: "",
    description: "",
    file: null,
  };
}

export default function UploadVideo() {
  const [videoMode, setVideoMode] = useState("single");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [gradeLevel, setGradeLevel] = useState("9");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] = useState("class-only");
  const [file, setFile] = useState(null);
  const [playlistEntries, setPlaylistEntries] = useState([createPlaylistEntry()]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setSubject("Mathematics");
    setGradeLevel("9");
    setKeywords("");
    setDescription("");
    setAccessLevel("class-only");
    setFile(null);
    setPlaylistEntries([createPlaylistEntry()]);
  };

  const handlePlaylistEntryChange = (index, field, value) => {
    setPlaylistEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const addPlaylistEntry = () => {
    setPlaylistEntries((current) => [...current, createPlaylistEntry()]);
  };

  const removePlaylistEntry = (index) => {
    setPlaylistEntries((current) =>
      current.length === 1
        ? current
        : current.filter((_, entryIndex) => entryIndex !== index),
    );
  };

  const validateBeforeSubmit = () => {
    if (videoMode === "single" && !file) {
      return "Please select an MP4 video file before uploading.";
    }

    if (videoMode === "playlist") {
      const hasMissingFile = playlistEntries.some((entry) => !entry.file);
      if (hasMissingFile) {
        return "Each playlist lesson needs its own MP4 file.";
      }

      const hasBlankTitle = playlistEntries.some(
        (entry) => !String(entry.title || "").trim(),
      );
      if (hasBlankTitle) {
        return "Give each playlist lesson a title so students can follow the sequence.";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationMessage = validateBeforeSubmit();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("subject", subject);
    formData.append("gradeLevel", gradeLevel);
    formData.append("keywords", keywords);
    formData.append("description", description);
    formData.append("accessLevel", accessLevel);
    formData.append("contentType", videoMode);

    if (videoMode === "single") {
      formData.append("file", file);
    } else {
      formData.append(
        "playlistEntries",
        JSON.stringify(
          playlistEntries.map((entry) => ({
            title: entry.title,
            description: entry.description,
          })),
        ),
      );
      playlistEntries.forEach((entry) => {
        formData.append("playlistFiles", entry.file);
      });
    }

    try {
      const response = await uploadVideo(formData);
      if (response.status === "ok") {
        setSuccess(true);
        resetForm();
        e.target.reset();
        return;
      }
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed. Please try again.");
      return;
    }

    setError("Upload failed. Please try again.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
          Digital Lessons
        </p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-zinc-900 dark:text-white">
          Upload Video Resource
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Share a single lesson or a full sequence of lesson videos for Ethiopian
          secondary school students.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          {videoMode === "playlist"
            ? "Playlist uploaded successfully. Students in the selected grade can now open the full lesson sequence."
            : "Video uploaded successfully. Students in the selected grade can now see the lesson."}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="grid gap-3 rounded-[1.5rem] bg-zinc-100 p-2 dark:bg-zinc-800/70 sm:grid-cols-2">
          <ModeButton
            active={videoMode === "single"}
            icon={Video}
            title="Single lesson"
            description="Upload one MP4 lesson."
            onClick={() => setVideoMode("single")}
          />
          <ModeButton
            active={videoMode === "playlist"}
            icon={ListVideo}
            title="Video playlist"
            description="Upload a guided lesson sequence."
            onClick={() => setVideoMode("playlist")}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {videoMode === "playlist" ? "Playlist Title" : "Video Title"}
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder={
                videoMode === "playlist"
                  ? "Grade 10 Chemistry Revision Series"
                  : "Grade 10 Chemistry: Acids and Bases Revision"
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Author / Teacher
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Teacher or department name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option>Mathematics</option>
              <option>Biology</option>
              <option>Chemistry</option>
              <option>Physics</option>
              <option>English</option>
              <option>History</option>
              <option>Geography</option>
              <option>Civics</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="class-only">Selected grade only</option>
              <option value="public">All students</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Keywords
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="revision, algebra, unit 3"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {videoMode === "playlist" ? "Playlist Overview" : "Description"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder={
                videoMode === "playlist"
                  ? "Explain what students will cover across the full playlist."
                  : "What this lesson covers and how students should use it."
              }
            />
          </div>
        </div>

        {videoMode === "single" ? (
          <label className="block rounded-[1.75rem] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition-colors hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800/50">
            <Upload size={30} className="mx-auto text-emerald-600" />
            <p className="mt-3 font-semibold text-zinc-700 dark:text-zinc-200">
              Choose an MP4 lesson file
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {file
                ? file.name
                : "Students in the selected grade will be notified automatically."}
            </p>
            <input
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
        ) : (
          <section className="space-y-4 rounded-[1.75rem] border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-700 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Playlist Lessons
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Upload the lessons in the order students should watch them.
                </p>
              </div>
              <button
                type="button"
                onClick={addPlaylistEntry}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <Plus size={16} />
                Add lesson
              </button>
            </div>

            <div className="space-y-4">
              {playlistEntries.map((entry, index) => (
                <article
                  key={`playlist-entry-${index + 1}`}
                  className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Lesson {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removePlaylistEntry(index)}
                      disabled={playlistEntries.length === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50 dark:border-red-900/40 dark:text-red-300"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <input
                      value={entry.title}
                      onChange={(e) =>
                        handlePlaylistEntryChange(index, "title", e.target.value)
                      }
                      className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      placeholder="Lesson title"
                    />
                    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:border-emerald-400 dark:border-zinc-600 dark:text-zinc-400">
                      <span className="truncate pr-3">
                        {entry.file ? entry.file.name : "Choose lesson MP4"}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        onChange={(e) =>
                          handlePlaylistEntryChange(
                            index,
                            "file",
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                    </label>
                    <textarea
                      value={entry.description}
                      onChange={(e) =>
                        handlePlaylistEntryChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      rows={3}
                      className="md:col-span-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      placeholder="Short note for this lesson."
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-700"
        >
          {videoMode === "playlist" ? <ListVideo size={20} /> : <Video size={20} />}
          {videoMode === "playlist" ? "Upload Playlist" : "Upload Video"}
        </button>
      </form>
    </div>
  );
}

function ModeButton({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.25rem] px-4 py-4 text-left transition-colors ${
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
      }`}
    >
      <Icon size={20} className={active ? "text-emerald-600" : "text-zinc-400"} />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </button>
  );
}
