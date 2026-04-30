import React, { useState } from "react";
import { AlertCircle, Book, CheckCircle2, Upload } from "lucide-react";
import { uploadBook } from "../data/resourceEndpoint";

const gradeOptions = [9, 10, 11, 12];

export default function UploadTextbook() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("English");
  const [gradeLevel, setGradeLevel] = useState("9");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [edition, setEdition] = useState("");
  const [isbn, setIsbn] = useState("");
  const [language, setLanguage] = useState("English");
  const [keywords, setKeywords] = useState("");
  const [accessLevel, setAccessLevel] = useState("class-only");
  const [description, setDescription] = useState("");
  const [formatType, setFormatType] = useState("digital");
  const [totalCopies, setTotalCopies] = useState("0");
  const [shelfLocation, setShelfLocation] = useState("");
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError("Please choose a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("subject", subject);
    formData.append("gradeLevel", gradeLevel);
    formData.append("keywords", keywords);
    formData.append("accessLevel", accessLevel);
    formData.append("description", description);
    formData.append("formatType", formatType);
    formData.append("totalCopies", totalCopies);
    formData.append("availableCopies", totalCopies);
    formData.append("shelfLocation", shelfLocation);
    formData.append("librarySection", "textbook");
    formData.append(
      "contentData",
      JSON.stringify({
        publisher,
        edition,
        isbn,
        language,
        resourceCategory: "textbook",
      }),
    );
    formData.append("file", file);

    const response = await uploadBook(formData);
    if (response.status === "ok") {
      setSuccess(true);
      setTitle("");
      setSubject("English");
      setGradeLevel("9");
      setAuthor("");
      setPublisher("");
      setEdition("");
      setIsbn("");
      setLanguage("English");
      setKeywords("");
      setAccessLevel("class-only");
      setDescription("");
      setFormatType("digital");
      setTotalCopies("0");
      setShelfLocation("");
      setFile(null);
      e.target.reset();
      return;
    }

    setError("Textbook upload failed. Please try again.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
          Library Shelf
        </p>
        <h1 className="mt-2 text-3xl font-serif font-bold text-zinc-900 dark:text-white">
          Upload Textbook
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Add curriculum books and revision booklets for the right Ethiopian high
          school grade.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2 size={22} />
          <span>Textbook uploaded and students in that grade have been notified.</span>
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
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <Book size={16} className="text-emerald-600" />
              Book Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Grade 11 English Student Textbook"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Author
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Author or publisher"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Publisher
            </label>
            <input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Publisher name"
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
              <option>English</option>
              <option>Mathematics</option>
              <option>Biology</option>
              <option>Chemistry</option>
              <option>Physics</option>
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
              Format
            </label>
            <select
              value={formatType}
              onChange={(e) => setFormatType(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="digital">Digital only</option>
              <option value="hybrid">Digital + physical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Language
            </label>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="English"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Edition
            </label>
            <input
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="3rd edition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ISBN / Catalog No.
            </label>
            <input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="ISBN or school catalog code"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Physical Copies
            </label>
            <input
              type="number"
              min="0"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="0"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Keywords
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="curriculum, revision, textbook"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Shelf Location
            </label>
            <input
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Section A-12"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
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
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Short note about this textbook edition or classroom use."
            />
          </div>
        </div>

        <label className="block rounded-[1.75rem] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-8 text-center transition-colors hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800/50">
          <Upload size={30} className="mx-auto text-emerald-600" />
          <p className="mt-3 font-semibold text-zinc-700 dark:text-zinc-200">
            Choose a PDF textbook
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {file ? file.name : "Only students in the selected grade will receive the alert."}
          </p>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-700"
        >
          Publish to Library
        </button>
      </form>
    </div>
  );
}
