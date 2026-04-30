import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, LogIn } from "lucide-react";

export default function LoginForm() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = await login(email, password);

    if (status !== "ok") {
      setError("Invalid email or password");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(202,138,4,0.18),_transparent_24%),linear-gradient(135deg,_#f7f4ea_0%,_#ffffff_48%,_#edf7f0_100%)] px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto grid min-h-[90vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[2rem] bg-[#7c2d12] p-10 text-white shadow-2xl lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-200">
            SMART ACCESS
          </p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight">
            Continue with your studies, one lesson at a time.
          </h1>
          <p className="mt-5 max-w-xl text-base text-amber-50/85">
            Access grade-based notifications, textbooks, worksheets, and video
            lessons prepared for Ethiopian secondary school learners.
          </p>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-[#1d4d2f] p-8 text-white">
            <img
              src="/logo-smart-access.svg"
              alt="SMART ACCESS logo"
              className="h-16 w-16 rounded-3xl object-cover"
            />
            <h1 className="mt-5 text-3xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-sm text-emerald-50/85">
              Sign in to reach your dashboard and school resources.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="student@school.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4d2f] py-3 font-bold text-white transition-all hover:bg-[#163b24]"
            >
              <LogIn size={19} />
              Sign In
            </button>

            <p className="text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-emerald-700">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
