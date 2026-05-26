import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Clock3,
  Edit3,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteExercise, getMyTeacherExercises } from "../data/teacherEndpoint";

export default function TeacherExercisesDesk() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);
  const {
    data: exercises = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-exercises"],
    queryFn: getMyTeacherExercises,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-exercises"]);
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (exerciseId) => {
    const confirmed = window.confirm(
      "Delete this exercise? This action cannot be undone.",
    );
    if (!confirmed) return;
    setDeletingId(exerciseId);
    deleteMutation.mutate(exerciseId);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading your exercises...
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
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
            Teacher Workflow
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Exercise Desk
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Review your published exercises and create new practice sets for
            students.
          </p>
        </div>
        <button
          onClick={() => navigate("/teacher/exercises/new")}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
        >
          <Plus size={16} />
          New exercise
        </button>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {exercises.length ? (
          exercises.map((exercise) => (
            <article
              key={exercise.exerciseId}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <GraduationCap size={12} />
                  Grade {exercise.gradeLevel || "All"}
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  {exercise.quizQuestions?.length || 0} questions
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {exercise.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {exercise.subject}
              </p>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {exercise.instructions || "No instructions added."}
              </p>
              <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} className="text-emerald-500" />
                  {exercise.timeLimit} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-500" />
                  {new Date(exercise.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/teacher/exercises/${exercise.exerciseId}/edit`)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exercise.exerciseId)}
                  disabled={deletingId === exercise.exerciseId}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
                >
                  <Trash2 size={16} />
                  {deletingId === exercise.exerciseId ? "Deleting…" : "Delete"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white py-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 md:col-span-2 xl:col-span-3">
            No exercises created yet.
          </div>
        )}
      </section>
    </div>
  );
}
