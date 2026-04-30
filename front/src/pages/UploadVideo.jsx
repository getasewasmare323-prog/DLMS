import React, { useState } from "react";
import { AlertCircle, Upload, Video } from "lucide-react";
import { uploadVideo } from "../data/resourceEndpoint";

const gradeOptions = [9, 10, 11, 12];

export default function UploadVideo() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [gradeLevel, setGradeLevel] = useState("9");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [accessLevel, setAccessLevel] = useState("class-only");
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError("Please select an MP4 video file before uploading.");
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
    formData.append("file", file);

    const response = await uploadVideo(formData);
    if (response.status === "ok") {
      setSuccess(true);
      setTitle("");
      setAuthor("");
      setSubject("Mathematics");
      setGradeLevel("9");
      setKeywords("");
      setDescription("");
      setAccessLevel("class-only");
      setFile(null);
      e.target.reset();
      return;
    }

    setError("Upload failed. Please try again.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
          Digital Lessons
        </p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-zinc-900 dark:text-white">
          Upload Video Resource
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Share recorded lessons for Ethiopian secondary school students by
          grade and subject.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          Video uploaded successfully. Students in the selected grade can now see the notification.
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Video Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Grade 10 Chemistry: Acids and Bases Revision"
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="What this lesson covers and how students should use it."
            />
          </div>
        </div>

        <label className="block rounded-[1.75rem] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition-colors hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800/50">
          <Upload size={30} className="mx-auto text-emerald-600" />
          <p className="mt-3 font-semibold text-zinc-700 dark:text-zinc-200">
            Choose an MP4 lesson file
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {file ? file.name : "Students in the selected grade will be notified automatically."}
          </p>
          <input
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-700"
        >
          <Video size={20} />
          Upload Video
        </button>
      </form>
    </div>
  );
}
