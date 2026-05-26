import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Edit3,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getExerciseById, updateExercise } from "../data/teacherEndpoint";

const gradeOptions = [9, 10, 11, 12];

export default function EditExercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [questions, setQuestions] = useState([
    { id: 1, text: "", options: ["", "", "", ""], correct: null },
  ]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [gradeLevel, setGradeLevel] = useState("9");
  const [instructions, setInstructions] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);

  const {
    data: exercise,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => getExerciseById(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateExercise(id, payload),
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(["teacher-exercises"]);
      window.setTimeout(() => setSuccess(false), 4000);
    },
  });

  useEffect(() => {
    if (!exercise) return;
    setTitle(exercise.title || "");
    setSubject(exercise.subject || "Mathematics");
    setGradeLevel(exercise.gradeLevel?.toString() || "9");
    setInstructions(exercise.instructions || "");
    setTimeLimit(exercise.timeLimit || 15);
    setQuestions(
      (exercise.quizQuestions || []).map((question, index) => ({
        id: question.questionId || Date.now() + index,
        text: question.content || "",
        options: [
          question.optionA || "",
          question.optionB || "",
          question.optionC || "",
          question.optionD || "",
        ],
        correct: ["A", "B", "C", "D"].indexOf(question.correctAnswer || "A"),
      })),
    );
  }, [exercise]);

  const letters = useMemo(() => ["A", "B", "C", "D"], []);

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      { id: Date.now(), text: "", options: ["", "", "", ""], correct: null },
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions((current) =>
      current.length > 1 ? current.filter((q) => q.id !== id) : current,
    );
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((current) =>
      current.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qId, optIdx, value) => {
    setQuestions((current) =>
      current.map((q) => {
        if (q.id !== qId) return q;
        const nextOptions = [...q.options];
        nextOptions[optIdx] = value;
        return { ...q, options: nextOptions };
      }),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    const invalidQuestion = questions.find(
      (question) =>
        !question.text.trim() ||
        question.options.some((option) => !option.trim()) ||
        question.correct === null,
    );

    if (invalidQuestion) {
      setValidationError(
        "Each question must include text, four options, and one selected correct answer.",
      );
      return;
    }

    mutation.mutate({
      title,
      subject,
      gradeLevel,
      instructions,
      timeLimit,
      questions,
    });
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading exercise...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      <header className="flex flex-col gap-6 border-b border-zinc-100 pb-10 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20">
              <Edit3 size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
              Teacher Exercise Builder
            </p>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">
            Edit Class Exercise
          </h1>
          <p className="font-medium italic text-zinc-500 dark:text-zinc-400">
            Update the exercise and keep your practice sets current.
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-3 text-white shadow-xl">
            <CheckCircle2 size={20} />
            <span className="text-sm font-bold">
              Exercise updated successfully
            </span>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <section className="space-y-8 rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Edit3 size={14} className="text-emerald-600" /> Exercise Title
              </label>
              <input
                required
                type="text"
                placeholder="Grade 10 Mathematics Weekly Practice"
                className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <FieldLabel label="Subject">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-zinc-900 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
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
            </FieldLabel>

            <FieldLabel label="Target Grade">
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-zinc-900 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
              >
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Time Duration (Minutes)">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-zinc-900 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  MIN
                </span>
              </div>
            </FieldLabel>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Clock size={14} className="text-emerald-600" /> Instructions
              </label>
              <textarea
                rows="3"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add short instructions for students before they start."
                className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
              />
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-serif font-bold dark:text-white">
              Questions
            </h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-950/30">
              {questions.length} Items Total
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className="group rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-sm transition-all hover:border-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-black text-white dark:bg-emerald-600">
                    #{qIndex + 1}
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Objective Question
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="p-2 text-zinc-300 transition-colors hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-8">
                <textarea
                  placeholder="Enter your question text here..."
                  className="w-full rounded-2xl bg-zinc-50 px-5 py-4 text-lg italic text-zinc-900 focus:ring-4 focus:ring-emerald-500/10 dark:bg-zinc-800/50 dark:text-white"
                  rows="2"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="relative space-y-2">
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        className={`w-full rounded-2xl pl-12 pr-5 py-4 text-sm border-none ${
                          q.correct === oIdx
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300"
                        }`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(q.id, oIdx, e.target.value)
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => updateQuestion(q.id, "correct", oIdx)}
                        className={`absolute left-4 top-[1.15rem] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          q.correct === oIdx
                            ? "border-white bg-white"
                            : "border-zinc-300 bg-transparent dark:border-zinc-600"
                        }`}
                      >
                        {q.correct === oIdx && (
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestion(q.id, "correct", oIdx)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                          q.correct === oIdx
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        Mark {letters[oIdx]} as correct
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {q.correct === null
                    ? "Select the correct answer for this question."
                    : `Correct answer: Option ${letters[q.correct]}`}
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-[2.5rem] border-2 border-dashed border-zinc-200 py-8 text-zinc-400 transition-all hover:border-emerald-600/50 hover:bg-emerald-50/10 hover:text-emerald-600 dark:border-zinc-800"
          >
            <div className="rounded-2xl bg-zinc-50 p-3 transition-transform group-hover:scale-110 dark:bg-zinc-800/50">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Add New Question
            </span>
          </button>
        </div>

        <footer className="flex flex-col items-center justify-between gap-6 border-t border-zinc-100 pt-10 dark:border-zinc-800 sm:flex-row">
          <div className="flex items-center gap-2 text-xs font-medium italic text-zinc-400">
            <HelpCircle size={14} />
            Students in the selected grade will receive a notification.
          </div>

          <div className="space-y-2">
            {validationError && (
              <p className="text-right text-sm text-red-600 dark:text-red-400">
                {validationError}
              </p>
            )}
            {mutation.isError && (
              <p className="text-right text-sm text-red-600 dark:text-red-400">
                {mutation.error.message}
              </p>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-3 rounded-[2rem] bg-zinc-900 px-12 py-5 font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-600"
            >
              {mutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Update Exercise
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

const FieldLabel = ({ label, children }) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
      {label}
    </label>
    {children}
  </div>
);
