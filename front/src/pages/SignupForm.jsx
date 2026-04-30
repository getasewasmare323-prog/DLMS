import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, BookOpen, GraduationCap, LogIn } from "lucide-react";

const classOptions = [9, 10, 11, 12];

export default function SignupForm() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [classLevel, setClassLevel] = useState("9");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const status = await signup(
      firstName,
      lastName,
      email,
      password,
      classLevel,
    );
    if (status !== "ok") {
      setError("Unable to register. Please check your details.");
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(21,128,61,0.16),_transparent_38%),linear-gradient(135deg,_#f7f4ea_0%,_#ffffff_48%,_#edf7f0_100%)] px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto grid min-h-[90vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[2rem] bg-[#123524] p-10 text-white shadow-2xl lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-300">
            SMART ACCESS
          </p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight">
            Join your school learning hub.
          </h1>
          <p className="mt-5 max-w-xl text-base text-emerald-50/85">
            Create a student account, choose your grade, and receive subject
            resources uploaded by teachers and librarians for your class level.
          </p>
          <div className="mt-10 grid gap-4">
            <InfoCard
              icon={GraduationCap}
              title="Grade-based notifications"
              text="Students only see alerts that match their class level."
            />
            <InfoCard
              icon={BookOpen}
              title="Local curriculum support"
              text="Built for Grades 9-12 with textbook, worksheet, and video access."
            />
          </div>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-[#1d4d2f] p-8 text-white">
            <img
              src="/logo-smart-access.svg"
              alt="SMART ACCESS logo"
              className="h-16 w-16 rounded-3xl object-cover"
            />
            <h1 className="mt-5 text-3xl font-bold">Create Student Account</h1>
            <p className="mt-2 text-sm text-emerald-50/85">
              Register for your school portal and pick the grade you belong to.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="First Name"
                value={firstName}
                onChange={setFirstName}
                placeholder="Meron"
              />
              <Field
                label="Last Name"
                value={lastName}
                onChange={setLastName}
                placeholder="Bekele"
              />
            </div>

            <Field
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="student@school.et"
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Grade Level
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {classOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
            />
            <Field
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat your password"
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4d2f] py-3 font-bold text-white transition-all hover:bg-[#163b24]"
            >
              <LogIn size={19} />
              Sign Up
            </button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-700">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {label}
    </label>
    <input
      type={type}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
    />
  </div>
);

const InfoCard = ({ icon: Icon, title, text }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
    <Icon size={18} className="text-amber-300" />
    <h3 className="mt-3 text-lg font-bold">{title}</h3>
    <p className="mt-2 text-sm text-emerald-50/80">{text}</p>
  </div>
);
