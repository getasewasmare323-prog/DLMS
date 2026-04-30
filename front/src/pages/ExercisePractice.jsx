import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  PlayCircle,
  RotateCcw,
} from "lucide-react";
import { getExerciseById } from "../data/teacherEndpoint";

const letters = ["A", "B", "C", "D"];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function ExercisePractice() {
  const { id } = useParams();
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => getExerciseById(id),
  });

  const score = useMemo(() => {
    if (!exercise) return 0;
    return exercise.quizQuestions.reduce(
      (total, question) =>
        total + (answers[question.id] === question.correctAnswer ? 1 : 0),
      0,
    );
  }, [answers, exercise]);

  useEffect(() => {
    if (!exercise) return;
    setSecondsLeft((exercise.timeLimit || 15) * 60);
  }, [exercise]);

  useEffect(() => {
    if (!isRunning || showResults || !secondsLeft) return;
    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          setShowResults(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isRunning, secondsLeft, showResults]);

  const startPractice = () => {
    if (!exercise) return;
    setAnswers({});
    setShowResults(false);
    setSecondsLeft((exercise.timeLimit || 15) * 60);
    setIsRunning(true);
  };

  const submitPractice = () => {
    setIsRunning(false);
    setShowResults(true);
  };

  const restartPractice = () => {
    if (!exercise) return;
    setAnswers({});
    setShowResults(false);
    setIsRunning(false);
    setSecondsLeft((exercise.timeLimit || 15) * 60);
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

  if (error || !exercise) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error?.message || "Exercise not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/exercises"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Timed Practice
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {exercise.title}
          </h1>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 dark:bg-emerald-950/30">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                Time Left
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatTime(secondsLeft)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {exercise.subject} {exercise.gradeLevel ? `· Grade ${exercise.gradeLevel}` : ""}
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {exercise.instructions || "Answer all questions before the timer ends."}
              </p>
              <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {exercise.quizQuestions?.length || 0} questions · {exercise.timeLimit} minutes
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startPractice}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <PlayCircle size={18} />
                Start
              </button>
              <button
                onClick={submitPractice}
                disabled={!isRunning && !Object.keys(answers).length}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 font-bold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
              >
                <CheckCircle2 size={18} />
                Submit
              </button>
              <button
                onClick={restartPractice}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 font-bold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                <RotateCcw size={18} />
                Restart
              </button>
            </div>

            {showResults && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                  Score
                </p>
                <h3 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {score} / {exercise.quizQuestions?.length || 0}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Correct answers are shown below for review.
                </p>
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          {exercise.quizQuestions?.map((question, index) => {
            const options = [
              question.optionA,
              question.optionB,
              question.optionC,
              question.optionD,
            ].filter(Boolean);

            return (
              <article
                key={question.id || index}
                className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {index + 1}
                  </span>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {question.content}
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  {options.map((option, optionIndex) => {
                    const optionLetter = letters[optionIndex];
                    const isSelected = answers[question.id] === optionLetter;
                    const isCorrect = question.correctAnswer === optionLetter;
                    const showCorrect = showResults && isCorrect;
                    const showWrong = showResults && isSelected && !isCorrect;

                    return (
                      <button
                        key={optionLetter}
                        disabled={showResults}
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionLetter,
                          }))
                        }
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                          showCorrect
                            ? "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : showWrong
                              ? "border-red-300 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                              : isSelected
                                ? "border-emerald-300 bg-white text-zinc-900 dark:border-emerald-700 dark:bg-zinc-800 dark:text-zinc-100"
                                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                        }`}
                      >
                        <span className="font-bold">{optionLetter}.</span> {option}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <p className="mt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Correct answer: {question.correctAnswer}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
