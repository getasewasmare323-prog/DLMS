import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Bell,
  GraduationCap,
  PlayCircle,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(21,128,61,0.16),_transparent_30%),linear-gradient(180deg,_#faf7ef_0%,_#fffdf8_42%,_#eef7f1_100%)] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 lg:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo-smart-access.svg"
            alt="SMART ACCESS logo"
            className="h-11 w-11 rounded-2xl object-cover shadow-lg shadow-emerald-800/25"
          />
          <div>
            <p className="font-serif text-2xl font-bold">SMART ACCESS</p>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">
              Digital Library System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden px-5 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Sign In
          </Link>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="rounded-full bg-[#1d4d2f] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#163b24]"
          >
            {user ? "Dashboard" : "Join School Portal"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pt-16">
        <div>
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">
            Grade 9 to 12 digital library
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            A modern digital library for Ethiopian high schools.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
            Teachers and librarians build a living school collection with textbooks,
            class documents, exercises, discussion spaces, and video lessons.
            Students receive notifications when a new item is added to their class shelf,
            so every learner enters a library that feels prepared for their grade.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#1d4d2f] px-7 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#163b24]"
            >
              {user ? "Enter Dashboard" : "Create Student Account"}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-7 py-4 font-bold text-zinc-700 transition-all hover:border-emerald-300 hover:text-emerald-700"
            >
              Open Portal
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-2xl shadow-emerald-900/10 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="relative space-y-5">
            <div className="rounded-[1.5rem] bg-[#123524] p-6 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">
                This week
              </p>
              <h3 className="mt-3 text-3xl font-bold">New grade-based alerts</h3>
              <p className="mt-2 text-sm text-emerald-50/80">
                Students receive automatic notices when a teacher or librarian
                adds a new item to their class shelf.
              </p>
            </div>
            <StatRow icon={Bell} title="Shelf notifications" text="Grade-specific updates for each student account." />
            <StatRow icon={PlayCircle} title="Media room" text="Recorded classes and revision sessions in one place." />
            <StatRow icon={GraduationCap} title="Study desks" text="Exercises and discussions built around Ethiopian secondary school learning." />
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200/70 bg-white/70 px-6 py-16 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/40 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <Feature
            icon={Shield}
            title="Protected reading collection"
            desc="A structured digital shelf for lesson notes, textbooks, references, and school media."
          />
          <Feature
            icon={Bell}
            title="Class-shelf delivery"
            desc="Notifications follow the student's grade so each new record reaches the right readers."
          />
          <Feature
            icon={GraduationCap}
            title="Built for Ethiopian high school"
            desc="Focused on Grades 9-12 with a school library identity that still supports exercises and discussion."
          />
        </div>
      </section>
    </div>
  );
}

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
      <Icon size={22} />
    </div>
    <h3 className="mt-5 text-xl font-bold">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
      {desc}
    </p>
  </div>
);

const StatRow = ({ icon: Icon, title, text }) => (
  <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50/90 p-5 dark:border-zinc-800 dark:bg-zinc-800/60">
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{text}</p>
      </div>
    </div>
  </div>
);
