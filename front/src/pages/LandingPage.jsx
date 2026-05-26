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
    <div
      className="min-h-screen bg-cover bg-center text-slate-900"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.18) 30%, rgba(255,255,255,0.9) 70%), url('/abcd.webp')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 lg:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo-smart-access.svg"
            alt="SMART ACCESS logo"
            className="h-12 w-12 rounded-2xl object-cover shadow-lg shadow-sky-500/20"
          />
          <div>
            <p className="font-serif text-2xl font-bold text-blue-600 drop-shadow-sm">
              SMART ACCESS
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-200">
              Digital Library System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden px-5 py-2 text-sm font-semibold rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="rounded-full bg-sky-700 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-800"
          >
            {user ? "Dashboard" : "Join School Portal"}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pt-16">
        <div>
          <p className="inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-sm shadow-emerald-500/20">
            Grade 9 to 12 digital library
          </p>
          <h1 className="mt-6 max-w-4xl rounded-3xl bg-sky-700 px-6 py-6 font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white shadow-lg shadow-sky-900/10 sm:text-6xl lg:text-7xl">
            A modern digital library for Ethiopian high schools.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-900 text-3xl font-bold bg-blue-50/70 p-4 rounded-lg shadow-md shadow-sky-300/20">
            Teachers and librarians build a dynamic school collection with
            textbooks, exams, class notes, video lessons, and interactive
            learning support. Students receive grade-specific alerts so every
            learner enters a library that feels prepared for their classroom.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-sky-700 px-7 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-800"
            >
              {user ? "Enter Dashboard" : "Create Student Account"}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-7 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700"
            >
              Open Portal
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-sky-500/10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-300/30 blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-200/30 blur-xl pointer-events-none" />
          <div className="relative space-y-5">
            <div className="rounded-[1.5rem] bg-sky-800 p-6 text-white shadow-xl shadow-sky-500/10">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                This week
              </p>
              <h3 className="mt-3 text-3xl font-bold">
                New grade-based alerts
              </h3>
              <p className="mt-2 text-sm text-sky-100">
                Students receive automatic notices when a teacher or librarian
                adds a new item to their class shelf.
              </p>
            </div>
            <StatRow
              icon={Bell}
              title="Shelf notifications"
              text="Grade-specific updates delivered to every student account."
            />
            <StatRow
              icon={PlayCircle}
              title="Media room"
              text="Recorded lessons, revision videos and school broadcasts in one place."
            />
            <StatRow
              icon={GraduationCap}
              title="Study desks"
              text="Exercises and guided practice aligned to Ethiopian secondary school grades."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-sky-50/70 px-6 py-16 lg:px-10">
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
            desc="Designed for Grades 9-12 with support for exercises, teacher notes, and library reviews."
          />
        </div>
      </section>
    </div>
  );
}

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm shadow-sky-200/20">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
      <Icon size={22} />
    </div>
    <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
  </div>
);

const StatRow = ({ icon: Icon, title, text }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-sky-100/20">
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  </div>
);
