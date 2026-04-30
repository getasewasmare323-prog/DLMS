import React, { useState } from "react";
import { FileText, CheckCircle, GraduationCap } from "lucide-react";
import { uploadBook } from "../data/resourceEndpoint";

const naturalScienceSubjects = [
  "English",
  "Mathematics (Natural)",
  "Physics",
  "Chemistry",
  "Biology",
  "Civics and Ethical Education",
  "Information Technology (IT)",
];

const socialScienceSubjects = [
  "English",
  "Mathematics (Social)",
  "Geography",
  "History",
  "Economics",
  "Civics and Ethical Education",
  "Information Technology (IT)",
];
export default function UploadDocument() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [subjectType, setSubjectType] = useState("Natural Science");
  const [subject, setSubject] = useState("English");
  const [accessLevel, setAccessLevel] = useState("class-only");
  const [author, setAuthor] = useState("");
  const [documentType, setDocumentType] = useState("worksheet");
  const [language, setLanguage] = useState("English");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file) {
      setError("Please choose a PDF file before uploading.");
      return;
    }

    const formData = new FormData(e.target);
    formData.append("file", file);
    formData.append("subjectType", subjectType);
    formData.append("subject", subject);
    formData.append("librarySection", "teacher-material");
    formData.append("accessLevel", accessLevel);
    formData.append("keywords", keywords);
    formData.append("description", description);
    formData.append("author", author);
    formData.append(
      "contentData",
      JSON.stringify({
        documentType,
        language,
        resourceCategory: "teacher-material",
      }),
    );
    const response = await uploadBook(formData);
    if (response.status === "ok") {
      setSuccess(true);
      e.target.reset();
      setAuthor("");
      setDocumentType("worksheet");
      setLanguage("English");
      setDescription("");
      setKeywords("");
      setFile(null);
      return;
    }

    setError("Document upload failed. Please try again.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-2xl">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Upload Class Documents
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Share worksheets, assignments or notes with the right Ethiopian high school class.
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle size={20} />
          <span>Document shared successfully with your class!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-brand-100 dark:border-zinc-800 shadow-sm space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Document Title
            </label>
            <input
              name="title"
              required
              placeholder="e.g. Unit 4: Linear Equations Worksheet"
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Grade Level
            </label>
            <input
              name="gradeLevel"
              required
              placeholder="e.g. Grade 10"
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Teacher / Author
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Teacher or department name"
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Keywords
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="worksheet, unit 4, algebra"
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="worksheet">Worksheet</option>
                <option value="assignment">Assignment</option>
                <option value="lesson-note">Lesson Note</option>
                <option value="revision-guide">Revision Guide</option>
                <option value="handout">Handout</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Language
              </label>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
                className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Document Type
              </label> */}
              <select
                className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                onChange={(e) => setSubjectType(e.target.value)}
                value={subjectType}
              >
                <option>Natural Science</option>
                <option>Social Science</option>
              </select>
            </div>
            <div className="space-y-2">
              {/* <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Subject
              </label> */}
              <select
                className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                onChange={(e) => setSubject(e.target.value)}
              >
                {(subjectType === "Natural Science"
                  ? naturalScienceSubjects
                  : socialScienceSubjects
                ).map((subj) => (
                  <option key={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              File
            </label>
            <div className="flex gap-2">
              {/* <span className="flex items-center px-3 bg-zinc-100 dark:bg-zinc-800 rounded-l-lg border border-r-0 border-zinc-200 dark:border-zinc-700 text-zinc-400"> */}
              {/* <Link2 size={18} /> */}
              {/* </span> */}
              <input
                type="file"
                placeholder="you can upload the files heir"
                className="flex-1 p-2.5 rounded-r-lg border border-l-0 border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                onChange={(e) => setFile(e.target.files[0])}
                accept="application/pdf"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Visibility
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
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
              className="w-full p-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Explain what students should use this document for."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          Upload & Share
        </button>
      </form>
    </div>
  );
}
