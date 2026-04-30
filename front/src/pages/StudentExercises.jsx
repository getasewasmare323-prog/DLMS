import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock3, GraduationCap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getExercises } from "../data/teacherEndpoint";

export default function StudentExercises() {
  const navigate = useNavigate();
  const { data: exercises = [], isLoading, error } = useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading exercises...
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
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">
          Student Exercises
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Practice by your class level
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Open a grade-level exercise to start a timed exam practice on its own page.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => (
          <button
            key={exercise.exerciseId}
            onClick={() => navigate(`/exercises/${exercise.exerciseId}`)}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900"
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
            <h3 className="mt-4 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {exercise.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {exercise.subject}
            </p>
            <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} className="text-emerald-500" />
                {exercise.timeLimit} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-500" />
                {exercise.creator?.firstName || "Teacher"}
              </span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
